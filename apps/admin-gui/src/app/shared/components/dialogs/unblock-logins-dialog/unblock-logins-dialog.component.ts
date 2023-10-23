import { Component, Inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { BlockedLogin } from '@perun-web-apps/perun/openapi';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';
import { GlobalNamespacePipe } from '@perun-web-apps/perun/pipes';

export interface UnblockLoginsDialogData {
  theme: string;
  logins: BlockedLogin[];
}

@Component({
  selector: 'app-unblock-logins-dialog',
  templateUrl: './unblock-logins-dialog.component.html',
  styleUrls: ['./unblock-logins-dialog.component.scss'],
  providers: [GlobalNamespacePipe],
})
export class UnblockLoginsDialogComponent implements OnInit {
  loading: boolean;
  theme: string;
  dataSource: MatTableDataSource<BlockedLogin>;
  displayedColumns = ['login', 'namespace'];

  constructor(
    public dialogRef: MatDialogRef<UnblockLoginsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnblockLoginsDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private usersService: UsersManagerService,
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<BlockedLogin>(this.data.logins);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    this.usersService.unblockLoginsById(this.data.logins.map((login) => login.id)).subscribe({
      next: () => {
        this.notificator.showInstantSuccess('ADMIN.BLOCKED_LOGINS.UNBLOCK_SUCCESS');
        this.dialogRef.close(true);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
