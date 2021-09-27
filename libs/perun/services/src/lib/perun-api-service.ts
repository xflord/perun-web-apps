import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PerunApiService {
  getHeaders(): HttpHeaders;

  get(path: string, showError: boolean): Observable<any>;

  put(path: string, body, showError: boolean): Observable<any>;

  post(path: string, body, showError: boolean): Observable<any>;

  delete(path, showError: boolean): Observable<any>;
}
