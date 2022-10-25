import { Injectable } from '@angular/core';
import { PasswordLabel, RPCError } from '@perun-web-apps/perun/models';

@Injectable({
  providedIn: 'root',
})
export class ErrorTranslateService {
  getErrorKey(error: RPCError): keyof PasswordLabel {
    const errName = error.name.split('Exception')[0];
    switch (errName) {
      case 'PasswordDoesntMatch':
        return 'passwordDoesntMatchError';
      case 'PasswordChangeFailed':
        return 'passwordChangeFailedError';
      case 'PasswordCreationFailed':
        return 'passwordCreationFailedError';
      case 'PasswordDeletionFailed':
        return 'passwordDeletionFailedError';
      case 'LoginNotExists':
        return 'loginNotExistsError';
      case 'PasswordStrengthFailed':
        return 'passwordStrengthFailedError';
      case 'PasswordOperationTimeout':
        return 'passwordOperationTimeoutError';
      default:
        return 'passwordCreationFailedError';
    }
  }
}
