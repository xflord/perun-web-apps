import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
import { AuthzResolverService, Group, PerunBean } from '@perun-web-apps/perun/openapi';
import { Role } from '@perun-web-apps/perun/models';

export interface RemoveGroupDialogData {
  complementaryObject: PerunBean;
  groups: Group[];
  role: Role;
  theme: string;
}

@Component({
  selector: 'app-remove-group-manager-dialog',
  templateUrl: './remove-group-manager-dialog.component.html',
  styleUrls: ['./remove-group-manager-dialog.component.scss'],
})
export class RemoveGroupManagerDialogComponent implements OnInit {
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Group>;
  loading: boolean;
  theme: string;

  constructor(
    public dialogRef: MatDialogRef<RemoveGroupManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveGroupDialogData,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private authzService: AuthzResolverService
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Group>(this.data.groups);
    this.theme = this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    this.authzService
      .unsetRoleWithGroupComplementaryObject({
        role: this.data.role,
        authorizedGroups: this.data.groups.map((group) => group.id),
        complementaryObject: this.data.complementaryObject,
      })
      .subscribe({
        next: () => {
          this.notificator.showSuccess(this.translate.instant('DIALOGS.REMOVE_GROUPS.SUCCESS'));
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: () => (this.loading = false),
      });
  }
}
