import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import {
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { AuthzResolverService, PerunBean, RichUser } from '@perun-web-apps/perun/openapi';
import { Role } from '@perun-web-apps/perun/models';

export interface RemoveManagerDialogData {
  complementaryObject: PerunBean;
  managers: RichUser[];
  role: Role;
  theme: string;
}

@Component({
  selector: 'app-remove-manager-dialog',
  templateUrl: './remove-manager-dialog.component.html',
  styleUrls: ['./remove-manager-dialog.component.scss'],
})
export class RemoveManagerDialogComponent implements OnInit {
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<RichUser>;
  loading: boolean;
  theme: string;
  removeSelf: boolean;

  constructor(
    public dialogRef: MatDialogRef<RemoveManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveManagerDialogData,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private authzService: AuthzResolverService,
    private store: StoreService,
    private authService: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<RichUser>(this.data.managers);
    this.theme = this.data.theme;
    this.removeSelf =
      this.data.managers.map((user) => user.id).includes(this.store.getPerunPrincipal().userId) &&
      !this.authService.isPerunAdmin();
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    this.authzService
      .unsetRoleWithUserComplementaryObject({
        role: this.data.role,
        users: this.data.managers.map((manager) => manager.id),
        complementaryObject: this.data.complementaryObject,
      })
      .subscribe({
        next: () => {
          this.notificator.showSuccess(this.translate.instant('DIALOGS.REMOVE_MANAGERS.SUCCESS'));
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: () => (this.loading = false),
      });
  }
}
