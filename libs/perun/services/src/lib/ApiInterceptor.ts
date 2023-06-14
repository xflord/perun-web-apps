import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize, tap, switchMap, catchError } from 'rxjs/operators';
import { HttpResponseError, RPCError } from '@perun-web-apps/perun/models';
import { AuthService } from './auth.service';
import { StoreService } from './store.service';
import { NotificatorService } from './notificator.service';
import { ApiRequestConfigurationService } from './api-request-configuration.service';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SessionExpirationDialogComponent } from '@perun-web-apps/perun/session-expiration';
import { InitAuthService } from './init-auth.service';
import { MfaHandlerService } from './mfa-handler.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  dialogRefSessionExpiration: MatDialogRef<SessionExpirationDialogComponent>;

  constructor(
    private authService: AuthService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private notificator: NotificatorService,
    private store: StoreService,
    private dialog: MatDialog,
    private initAuthService: InitAuthService,
    private mfaHandlerService: MfaHandlerService,
    private oauthService: OAuthService
  ) {}

  intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    const apiUrl: string = this.store.getProperty('api_url');
    // check if the request is trying to access localization file, if so
    // disable cache
    if (req.url.includes('i18n')) {
      req = req.clone({
        setHeaders: {
          'Cache-control': 'no-cache, must-revalidate',
        },
      });
    }
    if (
      apiUrl !== undefined &&
      this.isCallToPerunApi(req.url) &&
      !this.isLoggedIn() &&
      !this.dialogRefSessionExpiration &&
      !localStorage.getItem('mfaRequired')
    ) {
      const config = getDefaultDialogConfig();
      config.width = '450px';

      // Skip if the dialog is already open
      if (this.dialogRefSessionExpiration == null) {
        this.dialogRefSessionExpiration = this.dialog.open(
          SessionExpirationDialogComponent,
          config
        );
        this.dialogRefSessionExpiration.afterClosed().subscribe(() => {
          finalize(() => (this.dialogRefSessionExpiration = undefined));
          sessionStorage.setItem('auth:redirect', location.pathname);
          sessionStorage.setItem('auth:queryParams', location.search.substring(1));
          this.dialog.closeAll();
          this.oauthService.logOut(true);
          this.reauthenticate();
        });
      }
    }
    // Apply the headers
    if (this.initAuthService.isServiceAccess()) {
      req = req.clone({
        setHeaders: {
          Authorization:
            'Basic ' +
            btoa(
              sessionStorage.getItem('basicUsername') +
                ':' +
                sessionStorage.getItem('basicPassword')
            ),
        },
      });
    } else if (this.isCallToPerunApi(req.url)) {
      req = req.clone({
        setHeaders: {
          Authorization: this.authService.getAuthorizationHeaderValue(),
        },
      });
    }

    return this.handleRequest(req, next);
  }

  private isLoggedIn(): boolean {
    return (
      (this.authService.isLoggedIn() || this.initAuthService.isServiceAccess()) &&
      !this.initAuthService.isServiceAccessLoginScreenShown()
    );
  }

  private reauthenticate(): void {
    sessionStorage.setItem('auth:redirect', location.pathname);
    sessionStorage.setItem('auth:queryParams', location.search.substring(1));
    void this.initAuthService.handleAuthStart();
  }

  private handleRequest<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    // Also handle errors globally, if not disabled
    const shouldHandleError = this.apiRequestConfiguration.shouldHandleError();

    const shouldReloadPrincipal =
      req.method === 'POST' && this.isNotConsolidatorOrLinker() && this.isCallToPerunApi(req.url);

    return next.handle(req).pipe(
      tap((response) => {
        if (response instanceof HttpResponse && shouldReloadPrincipal) {
          void this.initAuthService.loadPrincipal();
        }
      }),
      catchError((err: HttpErrorResponse) => {
        const e = err.error as RPCError;
        // catch MFA required error and start MFA logic
        if (e.type === 'MfaPrivilegeException' || e.type === 'MfaRolePrivilegeException') {
          return this.mfaHandlerService.openMfaWindow(e.type === 'MfaRolePrivilegeException').pipe(
            switchMap((verified) => {
              if (verified) {
                if (e.type === 'MfaRolePrivilegeException') {
                  window.location.reload();
                }
                return this.handleRequest(this.replaceAuthenticationToken(req), next);
              }
              return throwError(() => e);
            })
          );
        } else {
          // Handle other errors
          this.handleInvalidAccessTokenError(err);
          const errRpc: RPCError = this.formatErrors(err, req);
          if (errRpc === undefined) {
            return throwError(() => err);
          }
          if (shouldHandleError) {
            this.notificator.showRPCError(errRpc);
          }
          return throwError(() => errRpc);
        }
      })
    );
  }

  private replaceAuthenticationToken<T>(req: HttpRequest<T>): HttpRequest<T> {
    return req.clone({
      setHeaders: {
        Authorization: this.authService.getAuthorizationHeaderValue(),
      },
    });
  }

  private isCallToPerunApi(url: string): boolean {
    return url.startsWith(this.store.getProperty('api_url'));
  }

  private formatErrors<T>(error: HttpErrorResponse, req: HttpRequest<T>): RPCError {
    let rpcError: RPCError;
    console.error(error);
    const innerError: RPCError = error.error as RPCError;
    if (innerError.errorId) {
      rpcError = innerError;
    }
    // FIXME not sure if this peace of code is actually needed
    // } else if (error.errorId) {
    //   rpcError = JSON.parse(error.error) as RPCError;
    // }
    if (rpcError === undefined) {
      return undefined;
    }
    rpcError.urlWithParams = req.urlWithParams;
    rpcError.call = req.url;
    rpcError.payload = req.body as unknown as object;
    return rpcError;
  }

  private isNotConsolidatorOrLinker(): boolean {
    const application = this.store.getProperty('application');
    return !(application === 'Linker' || application === 'Consolidator');
  }

  private handleInvalidAccessTokenError(err: HttpErrorResponse): void {
    if (err.status === 401) {
      // We skip unnecessary login dialog
      if (!this.isLoggedIn()) {
        return;
      }
      // Skip 'invalid_token'
      if ((err.error as HttpResponseError).error === 'invalid_token') {
        return;
      }
      // Skip if the dialog is already open
      if (this.dialogRefSessionExpiration != null) {
        return;
      }

      const config = getDefaultDialogConfig();
      this.dialogRefSessionExpiration = this.dialog.open(SessionExpirationDialogComponent, config);

      this.dialogRefSessionExpiration.afterClosed().subscribe(() => {
        this.oauthService.logOut(true);
        this.reauthenticate();
      });
    }
  }
}
