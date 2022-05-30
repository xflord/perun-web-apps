import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { FormControl, Validators } from '@angular/forms';

export interface AddSshDialogData {
  attribute: Attribute;
  userId: number;
}

@Component({
  selector: 'perun-web-apps-add-ssh-dialog',
  templateUrl: './add-ssh-dialog.component.html',
  styleUrls: ['./add-ssh-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddSshDialogComponent implements OnInit {
  static readonly allowedSshKeys = [
    'ssh-ed25519',
    'ssh-ed25519-cert-v01@openssh.com',
    'sk-ssh-ed25519@openssh.com',
    'sk-ssh-ed25519-cert-v01@openssh.com',
    'ssh-rsa',
    'ssh-dss',
    'ecdsa-sha2-nistp256',
    'ecdsa-sha2-nistp384',
    'ecdsa-sha2-nistp521',
    'sk-ecdsa-sha2-nistp256@openssh.com',
    'ssh-rsa-cert-v01@openssh.com',
    'ssh-dss-cert-v01@openssh.com',
    'ecdsa-sha2-nistp256-cert-v01@openssh.com',
    'ecdsa-sha2-nistp384-cert-v01@openssh.com',
    'ecdsa-sha2-nistp521-cert-v01@openssh.com',
    'sk-ecdsa-sha2-nistp256-cert-v01@openssh.com',
  ];
  static readonly sshKeyPattern = '^(' + AddSshDialogComponent.allowedSshKeys.join('|') + ').+$';
  sshControl: FormControl;

  constructor(
    private dialogRef: MatDialogRef<AddSshDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddSshDialogData,
    private attributesManagerService: AttributesManagerService
  ) {}

  ngOnInit(): void {
    this.sshControl = new FormControl(null, [
      Validators.required,
      Validators.pattern(AddSshDialogComponent.sshKeyPattern),
    ]);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    const keys: string[] = (this.data.attribute?.value as string[]) ?? [];
    const ssh = this.sshControl.value as string;
    if (!keys.includes(ssh)) {
      keys.push(ssh);
    }
    this.data.attribute.value = keys;

    this.attributesManagerService
      .setUserAttribute({ user: this.data.userId, attribute: this.data.attribute })
      .subscribe(
        () => {
          this.dialogRef.close(true);
        },
        () => {
          keys.pop();
        }
      );
  }
}
