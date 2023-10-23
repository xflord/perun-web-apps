import { Component, Inject, OnInit } from '@angular/core';
import { Service, ServicesManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
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
    private translate: PerunTranslateService,
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.services = this.data.services;
    this.relations.push(this.translate.instant('DIALOGS.DELETE_SERVICE.DESTINATION_RELATION'));
    this.anotherMessage = this.translate.instant('DIALOGS.DELETE_SERVICE.MORE_INFORMATION');
  }

  onConfirm(): void {
    this.loading = true;
    const servicesIds = this.services.map((service) => service.id);
    this.serviceManager.deleteServices(servicesIds, this.force).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.notificator.showSuccess(this.translate.instant('DIALOGS.DELETE_SERVICE.SUCCESS'));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
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
