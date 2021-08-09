import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import { RPCError } from '@perun-web-apps/perun/models';
import { PerunApiService } from './perun-api-service';
import { NotificatorService } from './notificator.service';
import { AuthService } from './auth.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService implements PerunApiService {

  constructor(
    private http: HttpClient,
    private notificator: NotificatorService,
    private authService: AuthService,
    private storeService: StoreService
  ) {
  }

  api_url: string;

  getApiUrl(): string {
    if (this.api_url === undefined) {
      this.api_url = this.storeService.get('api_url');
    }
    return this.api_url + "/";
  }

  private formatErrors(error: any, url: string, payload: any, showError) {
    const rpcError = error.error as RPCError;
    rpcError.call = url;
    rpcError.payload = payload;
    if (showError) {
      this.notificator.showRPCError(error.error);
    }
    return throwError(rpcError);
  }

  getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.authService.getAuthorizationHeaderValue());
    return headers;
  }

  get(path: string, params: HttpParams = new HttpParams(), showError = true): Observable<any> {
    const url = `${this.getApiUrl()}${path}`;
    return this.http.get(url, { headers: this.getHeaders() })
      .pipe(catchError(err => this.formatErrors(err, url, null, showError)));
  }

  put(path: string, body = {}, showError = true): Observable<any> {
    const url = `${this.getApiUrl()}${path}`;
    const payload = JSON.stringify(body);
    return this.http.put(
      url,
      payload, { headers: this.getHeaders() }
    ).pipe(catchError(err => this.formatErrors(err, url, payload, showError)));
  }

  post(path: string, body = {}, showError = true): Observable<any> {
    const url = `${this.getApiUrl()}${path}`;
    const payload = JSON.stringify(body);
    let headers = this.getHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.http.post(
      url,
      payload,
      {headers: headers}
    ).pipe(catchError(err => this.formatErrors(err, url, payload, showError)));
  }

  delete(path, showError = true): Observable<any> {
    const url = `${this.getApiUrl()}${path}`;
    return this.http.delete(
      url,
      { headers: this.getHeaders() }
    ).pipe(catchError(err => this.formatErrors(err, url, null, showError)));
  }
}
