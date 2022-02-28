import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ResourcesManagerService, Service } from '@perun-web-apps/perun/openapi';
import { MatTableDataSource } from '@angular/material/table';

export interface RemoveServiceFromResourceDialogData {
  resourceId: number;
  services: Service[];
  theme: string;
}

@Component({
  selector: 'app-perun-web-apps-remove-service-from-resource-dialog',
  templateUrl: './remove-service-from-resource-dialog.component.html',
  styleUrls: ['./remove-service-from-resource-dialog.component.scss'],
})
export class RemoveServiceFromResourceDialogComponent implements OnInit {
  theme: string;
  loading: boolean;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Service>;

  constructor(
    public dialogRef: MatDialogRef<RemoveServiceFromResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveServiceFromResourceDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private resourcesManager: ResourcesManagerService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<Service>(this.data.services);
  }

  onSubmit(): void {
    this.loading = true;
    const servicesIds: number[] = [];
    for (const service of this.data.services) {
      servicesIds.push(service.id);
    }
    this.resourcesManager.removeServices(this.data.resourceId, servicesIds).subscribe(
      () => {
        this.translate
          .get('DIALOGS.REMOVE_SERVICE_FROM_RESOURCE.SUCCESS')
          .subscribe((successMessage: string) => {
            this.notificator.showSuccess(successMessage);
            this.dialogRef.close(true);
          });
      },
      () => (this.loading = false)
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
