import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-add-token-info-dialog',
  templateUrl: './add-token-info-dialog.component.html',
  styleUrls: ['./add-token-info-dialog.component.scss']
})
export class AddTokenInfoDialogComponent {

  constructor(private dialogRef: MatDialogRef<AddTokenInfoDialogComponent>,
              private store: StoreService) { }

  onCancel() {
    this.dialogRef.close()
  }

  onAdd() {
    const url = this.store.get('mfa', 'register_totp_url')
    window.open(url, '_blank');
    this.dialogRef.close()
  }
}
