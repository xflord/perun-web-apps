import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { RegistrarManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';

export interface InviteMemberDialogData {
  theme: string;
  voId: number;
  groupId: number;
}

@Component({
  selector: 'app-invite-member-dialog',
  templateUrl: './invite-member-dialog.component.html',
  styleUrls: ['./invite-member-dialog.component.scss'],
})
export class InviteMemberDialogComponent implements OnInit {
  emailForm = new FormControl('', [Validators.required, Validators.email.bind(this)]);
  languages = ['en'];
  currentLanguage = 'en';
  name = new FormControl('', Validators.required as ValidatorFn);
  loading = false;
  theme: string;

  constructor(
    public dialogRef: MatDialogRef<InviteMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InviteMemberDialogData,
    private registrarManager: RegistrarManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.languages = this.store.getProperty('supported_languages');
    this.theme = this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    if (this.emailForm.invalid || this.name.invalid) {
      return;
    }
    if (this.data.voId && !this.data.groupId) {
      this.loading = true;
      this.registrarManager
        .sendInvitation(this.emailForm.value, this.currentLanguage, this.data.voId, this.name.value)
        .subscribe({
          next: () => {
            this.translate
              .get('DIALOGS.INVITE_MEMBER.SUCCESS')
              .subscribe((successMessage: string) => {
                this.notificator.showSuccess(successMessage);
                this.dialogRef.close(true);
              });
          },
          error: () => (this.loading = false),
        });
    } else {
      this.loading = true;
      this.registrarManager
        .sendInvitationForGroup(
          this.emailForm.value,
          this.currentLanguage,
          this.data.voId,
          this.data.groupId,
          this.name.value
        )
        .subscribe({
          next: () => {
            this.translate
              .get('DIALOGS.INVITE_MEMBER.SUCCESS')
              .subscribe((successMessage: string) => {
                this.notificator.showSuccess(successMessage);
                this.dialogRef.close(true);
              });
          },
          error: () => (this.loading = false),
        });
    }
  }
}
