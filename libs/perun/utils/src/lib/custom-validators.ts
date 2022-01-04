import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {

  static passwordMatchValidator(control: AbstractControl) {
    const password: string = control.get('passwordCtrl').value;
    const confirmPassword: string = control.get('passwordAgainCtrl').value;

    control.get('passwordAgainCtrl').setErrors(password !== confirmPassword ? { noPasswordMatch: true } : null);
    return null;
  }

  static patternValidator(regexes: RegExp[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      let counter = 0;
      for (const regex of regexes) {
       counter+= regex.test(control.value) ? 1 : 0;
      }

      return counter >= 3 ? null : <ValidationErrors>{ isWeak: true };
    };
  }
}
