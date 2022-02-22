import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RPCError } from '@perun-web-apps/perun/models';
import { PerunApiService } from './perun-api-service';
import { NotificatorService } from './notificator.service';
import { AuthService } from './auth.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService implements PerunApiService {
  api_url: string;
  constructor(
    private http: HttpClient,
    private notificator: NotificatorService,
    private authService: AuthService,
    private storeService: StoreService
  ) {}

  getApiUrl(): string {
    if (this.api_url === undefined) {
      this.api_url = this.storeService.get('api_url') as string;
    }
    return this.api_url + '/';
  }

  getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.authService.getAuthorizationHeaderValue());
    return headers;
  }

  get(path: string, showError = true): Observable<object> {
    const url = `${this.getApiUrl()}${path}`;
    return this.http
      .get(url, { headers: this.getHeaders() })
      .pipe(catchError((err: HttpErrorResponse) => this.formatErrors(err, url, null, showError)));
  }

  put(path: string, body = {}, showError = true): Observable<object> {
    const url = `${this.getApiUrl()}${path}`;
    const payload = JSON.stringify(body);
    return this.http
      .put(url, payload, { headers: this.getHeaders() })
      .pipe(
        catchError((err: HttpErrorResponse) => this.formatErrors(err, url, payload, showError))
      );
  }

  post(path: string, body = {}, showError = true): Observable<object> {
    const url = `${this.getApiUrl()}${path}`;
    const payload = JSON.stringify(body);
    let headers = this.getHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.http
      .post(url, payload, { headers: headers })
      .pipe(
        catchError((err: HttpErrorResponse) => this.formatErrors(err, url, payload, showError))
      );
  }

  delete(path: string, showError = true): Observable<object> {
    const url = `${this.getApiUrl()}${path}`;
    return this.http
      .delete(url, { headers: this.getHeaders() })
      .pipe(catchError((err: HttpErrorResponse) => this.formatErrors(err, url, null, showError)));
  }

  private formatErrors(
    error: HttpErrorResponse,
    url: string,
    payload: string,
    showError: boolean
  ): Observable<never> {
    const rpcError = error.error as RPCError;
    rpcError.call = url;
    rpcError.payload = payload as unknown as object;
    if (showError) {
      this.notificator.showRPCError(error.error as RPCError);
    }
    return throwError(rpcError);
  }
}
