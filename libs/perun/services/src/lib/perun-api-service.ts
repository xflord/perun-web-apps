import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PerunApiService {
  getHeaders(): HttpHeaders;

  get(path: string, showError: boolean): Observable<object>;

  put(path: string, body, showError: boolean): Observable<object>;

  post(path: string, body, showError: boolean): Observable<object>;

  delete(path, showError: boolean): Observable<object>;
}
