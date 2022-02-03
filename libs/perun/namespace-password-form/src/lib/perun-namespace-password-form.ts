import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService } from '@perun-web-apps/perun/services';
import { of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

/**
 * State matcher that shows error on inputs whenever the input is changed and invalid (by default, the error
 * is shown after leaving the input field)
 */
export class ImmediateStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && control.dirty);
  }
}

export const loginAsyncValidator =
  (
    namespace: string,
    usersManager: UsersManagerService,
    apiRequestConfiguration: ApiRequestConfigurationService,
    time: number = 500
  ) =>
  (input: FormControl) =>
    timer(time).pipe(
      switchMap(() => {
        apiRequestConfiguration.dontHandleErrorForNext();
        if (!namespace || namespace === 'No namespace') {
          return of(null);
        }
        return usersManager.checkPasswordStrength(input.value, namespace);
      }),
      map(() => null),
      // catch error and send it as a valid value
      catchError((err) =>
        of({ backendError: err.error.message.substr(err.error.message.indexOf(':') + 1) })
      )
    );
