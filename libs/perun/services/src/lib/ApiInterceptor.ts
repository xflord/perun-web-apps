import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { RPCError } from '@perun-web-apps/perun/models';
import { AuthService } from './auth.service';
import { StoreService } from './store.service';
import { NotificatorService } from './notificator.service';
import { ApiRequestConfigurationService } from './api-request-configuration.service';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SessionExpirationDialogComponent } from '@perun-web-apps/perun/session-expiration';
import { InitAuthService } from './init-auth.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private notificator: NotificatorService,
    private store: StoreService,
    private dialog: MatDialog,
    private initAuthService: InitAuthService
  ) {}

  dialogRefSessionExpiration: MatDialogRef<SessionExpirationDialogComponent>;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const apiUrl = this.store.get('api_url');
    // check if the request is trying to access localization file, if so
    // disable cache
    if (req.url.indexOf('i18n') !== -1) {
      req = req.clone({
        setHeaders: {
          'Cache-control': 'no-cache, must-revalidate',
        },
      });
    }
    if (
      apiUrl !== undefined &&
      this.isCallToPerunApi(req.url) &&
      !this.store.skipOidc() &&
      !this.authService.isLoggedIn() &&
      !this.initAuthService.isServiceAccess() &&
      !this.dialogRefSessionExpiration
    ) {
      const config = getDefaultDialogConfig();
      config.width = '450px';

      this.dialogRefSessionExpiration = this.dialog.open(SessionExpirationDialogComponent, config);
      this.dialogRefSessionExpiration.afterClosed().subscribe(() => {
        finalize(() => (this.dialogRefSessionExpiration = undefined));
        sessionStorage.setItem('auth:redirect', location.pathname);
        sessionStorage.setItem('auth:queryParams', location.search.substr(1));
        this.authService.startAuthentication();
      });
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
    // Also handle errors globally, if not disabled
    const shouldHandleError = this.apiRequestConfiguration.shouldHandleError();

    const shouldReloadPrincipal =
      req.method === 'POST' && !this.store.skipOidc() && this.isCallToPerunApi(req.url);

    return next.handle(req).pipe(
      tap(
        (x) => {
          if (x instanceof HttpResponse && shouldReloadPrincipal) {
            this.initAuthService.loadPrincipal();
          }
        },
        (err) => {
          // Handle this err
          const errRpc = this.formatErrors(err, req);
          if (errRpc === undefined) {
            return throwError(err);
          }
          if (shouldHandleError) {
            this.notificator.showRPCError(errRpc);
          } else {
            return throwError(errRpc);
          }
        }
      )
    );
  }

  private isCallToPerunApi(url: string): boolean {
    return url.startsWith(this.store.get('api_url'));
  }

  private formatErrors(error: any, req: HttpRequest<any>) {
    let rpcError;
    console.error(error);
    if (error.error.errorId) {
      rpcError = error.error;
    } else if (error.errorId) {
      rpcError = JSON.parse(error.error) as RPCError;
    }
    if (rpcError === undefined) {
      return undefined;
    }
    rpcError.urlWithParams = req.urlWithParams;
    rpcError.call = req.url;
    rpcError.payload = req.body;
    return rpcError;
  }
}
