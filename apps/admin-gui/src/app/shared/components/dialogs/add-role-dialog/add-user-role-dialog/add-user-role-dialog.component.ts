import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { AddRoleDialogData, AddRoleForm } from '../add-role-dialog.component';
import { PerunTranslateService } from '@perun-web-apps/perun/services';
import { DisplayedRolePipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'app-add-user-role-dialog',
  templateUrl: './add-user-role-dialog.component.html',
  styleUrls: ['./add-user-role-dialog.component.scss'],
  providers: [DisplayedRolePipe],
})
export class AddUserRoleDialogComponent {
  loading = false;
  rules = this.authResolver.getAssignableRoleRules('USER');

  constructor(
    private dialogRef: MatDialogRef<AddUserRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddRoleDialogData,
    private authResolver: GuiAuthResolver,
    private authzService: AuthzResolverService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private displayedRole: DisplayedRolePipe
  ) {}

  addRole(formValue: AddRoleForm): void {
    this.loading = true;
    if (!formValue.entities || formValue.entities.length === 0) {
      this.authzService
        .setRoleForUser({ role: formValue.role.roleName, user: this.data.entityId })
        .subscribe({
          next: () => {
            this.showSuccess(formValue.role.displayName);
            this.dialogRef.close(true);
          },
          error: () => {
            this.loading = false;
          },
        });
    } else {
      this.authzService
        .setRoleWithUserComplementaryObjects({
          role: formValue.role.roleName,
          user: this.data.entityId,
          complementaryObjects: formValue.entities,
        })
        .subscribe({
          next: () => {
            this.showSuccess(formValue.role.displayName);
            this.dialogRef.close(true);
          },
          error: () => {
            this.loading = false;
          },
        });
    }
  }

  private showSuccess(role: string): void {
    this.notificator.showSuccess(
      this.translate.instant('DIALOGS.ADD_ROLE.SUCCESS', {
        role: role,
      })
    );
  }
}
