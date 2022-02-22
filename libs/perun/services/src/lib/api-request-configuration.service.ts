import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiRequestConfigurationService {
  private handleNextError = true;

  dontHandleErrorForNext(): void {
    this.handleNextError = false;
  }

  shouldHandleError(): boolean {
    const value: boolean = this.handleNextError;
    this.handleNextError = true;
    return value;
  }
}
