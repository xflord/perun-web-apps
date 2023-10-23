import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RichUserExtSource, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { MatTableDataSource } from '@angular/material/table';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';

export interface RemoveUserExtSourceDialogData {
  showSuccess: boolean;
  userId: number;
  extSources: RichUserExtSource[];
  theme: string;
}

@Component({
  selector: 'perun-web-apps-remove-user-ext-source-dialog',
  templateUrl: './remove-user-ext-source-dialog.component.html',
  styleUrls: ['./remove-user-ext-source-dialog.component.scss'],
})
export class RemoveUserExtSourceDialogComponent implements OnInit {
  successMessage: string;
  theme: string;
  force = false;
  loading: boolean;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<RichUserExtSource>;

  constructor(
    private dialogRef: MatDialogRef<RemoveUserExtSourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: RemoveUserExtSourceDialogData,
    private usersManagerService: UsersManagerService,
    private translate: PerunTranslateService,
    private notificator: NotificatorService,
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<RichUserExtSource>(this.data.extSources);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;

    const extSourcesIds = this.data.extSources.map((src) => src.userExtSource.id);
    this.usersManagerService
      .removeUserExtSources(this.data.userId, extSourcesIds, this.force)
      .subscribe({
        next: () => {
          this.loading = false;
          if (this.data.showSuccess) {
            this.notificator.showSuccess(
              this.translate.instant('SHARED_LIB.PERUN.COMPONENTS.REMOVE_USER_EXT_SOURCE.SUCCESS'),
            );
          }
          this.dialogRef.close(true);
        },
        error: () => (this.loading = false),
      });
  }
}
