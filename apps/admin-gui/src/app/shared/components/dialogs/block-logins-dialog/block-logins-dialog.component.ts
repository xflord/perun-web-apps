import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { FormControl, Validators } from '@angular/forms';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';

export interface BlockLoginsDialogData {
  theme: string;
  namespaceOptions: string[];
}

@Component({
  selector: 'app-block-logins-dialog',
  templateUrl: './block-logins-dialog.component.html',
  styleUrls: ['./block-logins-dialog.component.scss'],
})
export class BlockLoginsDialogComponent {
  loading = false;
  blockLogins = new FormControl('', Validators.required);
  namespace = new FormControl('', Validators.required);
  isGlobal = true;
  selectedNamespace: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<BlockLoginsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BlockLoginsDialogData,
    private store: StoreService,
    private usersService: UsersManagerService,
    private notificator: NotificatorService
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    this.usersService
      .blockLogins(
        this.blockLogins.value.split('\n').map((login) => login.trim()),
        this.isGlobal ? null : this.selectedNamespace
      )
      .subscribe({
        next: () => {
          this.notificator.showInstantSuccess('ADMIN.BLOCKED_LOGINS.BLOCK_SUCCESS');
          this.dialogRef.close(true);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }
}
