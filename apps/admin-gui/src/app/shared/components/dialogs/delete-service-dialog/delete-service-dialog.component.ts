import { Component, Inject, OnInit } from '@angular/core';
import { Service, ServicesManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { DeleteDialogResult } from '@perun-web-apps/perun/dialogs';

export interface DeleteServiceDialogData {
  theme: string;
  services: Service[];
}

@Component({
  selector: 'app-delete-service-dialog',
  templateUrl: './delete-service-dialog.component.html',
  styleUrls: ['./delete-service-dialog.component.scss'],
})
export class DeleteServiceDialogComponent implements OnInit {
  theme: string;
  dataSource = new MatTableDataSource<Service>(this.data.services);
  loading = false;
  relations: string[] = [];
  anotherMessage: string;
  private services: Service[];
  private force = false;

  constructor(
    private dialogRef: MatDialogRef<DeleteServiceDialogData>,
    @Inject(MAT_DIALOG_DATA) private data: DeleteServiceDialogData,
    private serviceManager: ServicesManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.services = this.data.services;
    this.relations.push(
      this.translate.instant('DIALOGS.DELETE_SERVICE.DESTINATION_RELATION') as string
    );
    this.anotherMessage = this.translate.instant(
      'DIALOGS.DELETE_SERVICE.MORE_INFORMATION'
    ) as string;
  }

  onConfirm(): void {
    if (this.services.length === 0) {
      this.dialogRef.close(true);
      this.notificator.showSuccess(
        this.translate.instant('DIALOGS.DELETE_SERVICE.SUCCESS') as string
      );
      return;
    }
    this.loading = true;
    this.serviceManager.deleteService(this.services.pop().id, this.force).subscribe(
      () => {
        this.onConfirm();
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(result: DeleteDialogResult): void {
    this.force = result.force;
    if (result.deleted) {
      this.onConfirm();
    } else {
      this.onCancel();
    }
  }
}
