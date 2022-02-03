import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiRequestConfigurationService {
  private handleNextError = true;

  dontHandleErrorForNext() {
    this.handleNextError = false;
  }

  shouldHandleError() {
    const value = this.handleNextError;
    this.handleNextError = true;
    return value;
  }
}
