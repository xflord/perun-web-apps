import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { AddRoleDialogData, AddRoleForm } from '../add-role-dialog.component';
import { DisplayedRolePipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'app-add-group-role-dialog',
  templateUrl: './add-group-role-dialog.component.html',
  styleUrls: ['./add-group-role-dialog.component.scss'],
  providers: [DisplayedRolePipe],
})
export class AddGroupRoleDialogComponent {
  loading = false;
  rules = this.authResolver.getAssignableRoleRules('GROUP');

  constructor(
    private dialogRef: MatDialogRef<AddGroupRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddRoleDialogData,
    private authResolver: GuiAuthResolver,
    private authzService: AuthzResolverService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private displayedRole: DisplayedRolePipe
  ) {}

  addRole(formValue: AddRoleForm): void {
    this.loading = true;
    if (!formValue.entity) {
      this.authzService
        .setRoleForGroup({ role: formValue.role, authorizedGroup: this.data.entityId })
        .subscribe({
          next: () => {
            this.showSuccess(formValue.role);
            this.dialogRef.close(true);
          },
          error: () => {
            this.loading = false;
          },
        });
    } else {
      this.authzService
        .setRoleWithGroupComplementaryObject({
          role: formValue.role,
          authorizedGroups: [this.data.entityId],
          complementaryObject: formValue.entity,
        })
        .subscribe({
          next: () => {
            this.showSuccess(formValue.role);
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
        role: this.displayedRole.transform(role),
      })
    );
  }
}