import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MembersManagerService,
  NamespaceRules,
  UsersManagerService,
} from '@perun-web-apps/perun/openapi';
import { Observable } from 'rxjs';
import { debounceTime, map, switchMap, take } from 'rxjs/operators';
import { enableFormControl } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-login-for-namespace',
  templateUrl: './login-for-namespace.component.html',
  styleUrls: ['./login-for-namespace.component.scss'],
})
export class LoginForNamespaceComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() filteredNamespaces: string[] = null;
  @Output() namespaceChanged = new EventEmitter<string>();
  @Output() parsedRulesChanged = new EventEmitter<Map<string, { login: string }>>();

  namespaceOptions: string[] = [];
  selectedNamespace: string = null;
  namespaceRules: NamespaceRules[] = [];
  parsedRules: Map<string, { login: string }> = new Map<string, { login: string }>();

  constructor(
    private membersManagerService: MembersManagerService,
    private usersManagerService: UsersManagerService
  ) {}

  ngOnInit(): void {
    this.namespaceOptions = ['Not selected'];
    this.membersManagerService.getAllNamespacesRules().subscribe((rules) => {
      this.namespaceRules = rules;
      this.parseNamespaceRules();
    });

    this.onNamespaceChanged('Not selected');
  }

  existingLoginValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      let namespace: string = (this.formGroup.get('namespaceCtrl').value as string).toLowerCase();
      namespace = namespace === 'not selected' ? 'mu' : namespace;
      return control.valueChanges.pipe(
        debounceTime(500),
        take(1),
        switchMap(() =>
          this.usersManagerService
            .isLoginAvailable(namespace, control.value as string)
            .pipe(map((res) => (res ? null : { loginExists: true })))
        )
      );
    };
  }

  parseNamespaceRules(): void {
    for (const rule of this.namespaceRules) {
      if (
        this.filteredNamespaces === null ||
        !this.filteredNamespaces.includes(rule.namespaceName)
      ) {
        this.namespaceOptions.push(rule.namespaceName);

        const fieldTypes = { login: 'disabled' };
        this.parseAttributes(fieldTypes, rule.requiredAttributes, 'required');
        this.parseAttributes(fieldTypes, rule.optionalAttributes, 'optional');

        this.parsedRules.set(rule.namespaceName, fieldTypes);
      }
    }
    this.parsedRulesChanged.emit(this.parsedRules);
  }

  parseAttributes(field: { login: string }, attributes: string[], type: string): void {
    for (const att of attributes) {
      switch (att) {
        case 'login': {
          field.login = type;
          break;
        }
        default:
          break;
      }
    }
  }

  onNamespaceChanged(namespace: string): void {
    this.selectedNamespace = namespace.toLowerCase();
    const login = this.formGroup.get('loginCtrl');
    if (namespace !== 'Not selected') {
      if (this.parsedRules.get(this.selectedNamespace).login === 'disabled') {
        login.disable();
        login.setValue('');
      } else {
        const loginValidators = [
          Validators.required,
          Validators.pattern('^[a-z][a-z0-9_-]+$'),
          Validators.maxLength(15),
          Validators.minLength(2),
        ];
        enableFormControl(login, loginValidators, [this.existingLoginValidator()]);
      }
    } else {
      login.disable();
      login.setValue('');
    }
    this.namespaceChanged.emit(namespace);
  }
}
