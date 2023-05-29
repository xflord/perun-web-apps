import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-change-expiration-dialog',
  templateUrl: './change-expiration-dialog.component.html',
  styleUrls: ['./change-expiration-dialog.component.scss'],
})
export class ChangeExpirationDialogComponent implements OnInit {
  @Input() status: string;
  @Input() currentExpiration: string;
  @Input() canExtendInVo = false;
  @Input() canExtendInGroup = false;
  @Output() expirationChanged: EventEmitter<string> = new EventEmitter<string>();

  newExpiration: string;
  minDate: Date;
  maxDate: Date;

  constructor(private dialogRef: MatDialogRef<ChangeExpirationDialogComponent>) {}

  ngOnInit(): void {
    this.setDateBounds();
  }

  onChangeExpiration(): void {
    this.expirationChanged.emit(this.newExpiration);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  setExpiration(newExp: string): void {
    this.newExpiration = newExp;
  }

  private setDateBounds(): void {
    if (this.status === 'VALID') {
      this.minDate = new Date();
      this.maxDate = null;
    } else if (this.status === 'EXPIRED') {
      this.minDate = null;
      this.maxDate = new Date();
    } else {
      // Change expiration of sponsorship
      this.minDate = new Date();
    }
  }
}
