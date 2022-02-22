import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static passwordMatchValidator(control: AbstractControl): void {
    const password: string = control.get('passwordCtrl').value as string;
    const confirmPassword: string = control.get('passwordAgainCtrl').value as string;

    control
      .get('passwordAgainCtrl')
      .setErrors(password !== confirmPassword ? { noPasswordMatch: true } : null);
    return null;
  }

  static patternValidator(regexes: RegExp[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      let counter = 0;
      for (const regex of regexes) {
        counter += regex.test(control.value as string) ? 1 : 0;
      }

      return counter >= 3 ? null : ({ isWeak: true } as ValidationErrors);
    };
  }
}
