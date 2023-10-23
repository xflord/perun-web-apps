import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Owner, OwnersManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-delete-owner-dialog',
  templateUrl: './delete-owner-dialog.component.html',
  styleUrls: ['./delete-owner-dialog.component.scss'],
})
export class DeleteOwnerDialogComponent implements OnInit {
  loading: boolean;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Owner>;
  owners: Owner[] = [];

  constructor(
    public dialogRef: MatDialogRef<DeleteOwnerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Owner[],
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private ownersManagerService: OwnersManagerService,
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Owner>(this.data);
    this.owners = this.data;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    const ownerIds = this.owners.map((owner) => owner.id);
    this.ownersManagerService.deleteOwners(ownerIds).subscribe({
      next: () => {
        this.loading = false;
        this.notificator.showSuccess(this.translate.instant('DIALOGS.DELETE_OWNER.SUCCESS'));
        this.dialogRef.close(true);
      },
      error: () => (this.loading = false),
    });
  }
}
