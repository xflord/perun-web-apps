import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { InputCreateOwner, OwnersManagerService } from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { emailRegexString } from '@perun-web-apps/perun/utils';
import OwnerTypeEnum = InputCreateOwner.OwnerTypeEnum;

@Component({
  selector: 'app-add-owner-dialog',
  templateUrl: './add-owner-dialog.component.html',
  styleUrls: ['./add-owner-dialog.component.scss'],
})
export class AddOwnerDialogComponent implements OnInit {
  successMessage: string;
  loading: boolean;
  nameCtrl: UntypedFormControl;
  contactCtrl: UntypedFormControl;
  type = '1';

  constructor(
    private dialogRef: MatDialogRef<AddOwnerDialogComponent>,
    private notificator: NotificatorService,
    private ownersManagerService: OwnersManagerService,
    private translate: TranslateService
  ) {
    translate
      .get('DIALOGS.ADD_OWNER.SUCCESS')
      .subscribe((value: string) => (this.successMessage = value));
  }

  ngOnInit(): void {
    this.nameCtrl = new UntypedFormControl(null, [
      Validators.required,
      Validators.pattern('^[\\w.-]+( [\\w.-]+)*$'),
    ]);
    this.contactCtrl = new UntypedFormControl(null, [
      Validators.required,
      Validators.pattern(emailRegexString),
    ]);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    this.ownersManagerService
      .createOwner({
        name: this.nameCtrl.value as string,
        contact: this.contactCtrl.value as string,
        ownerType: Number(this.type) as OwnerTypeEnum,
      })
      .subscribe(
        () => {
          this.notificator.showSuccess(this.successMessage);
          this.loading = false;
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
  }
}
