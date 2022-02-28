import { Component, Inject, OnInit } from '@angular/core';
import { RichDestination, ServicesManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

export interface RemoveDestinationDialogData {
  destinations: RichDestination[];
  theme: string;
}

@Component({
  selector: 'app-perun-web-apps-remove-destination-dialog',
  templateUrl: './remove-destination-dialog.component.html',
  styleUrls: ['./remove-destination-dialog.component.scss'],
})
export class RemoveDestinationDialogComponent implements OnInit {
  displayedColumns: string[] = [];
  loading = false;
  theme: string;
  destinations: RichDestination[];
  dataSource: MatTableDataSource<RichDestination>;

  constructor(
    public dialogRef: MatDialogRef<RemoveDestinationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemoveDestinationDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private serviceManager: ServicesManagerService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.destinations = this.data.destinations;
    this.displayedColumns =
      this.theme === 'admin-theme'
        ? ['destinationId', 'facility', 'destination', 'type', 'propagationType']
        : ['destinationId', 'service', 'destination', 'type', 'propagationType'];
    this.dataSource = new MatTableDataSource<RichDestination>(this.data.destinations);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  deleteDestinations(): void {
    if (this.destinations.length === 0) {
      this.notificator.showSuccess(
        this.translate.instant('DIALOGS.REMOVE_DESTINATIONS.SUCCESS') as string
      );
      this.dialogRef.close(true);
      return;
    }
    const destination = this.destinations.pop();
    this.serviceManager
      .removeDestination(
        destination.service.id,
        destination.facility.id,
        destination.destination,
        destination.type
      )
      .subscribe(
        () => {
          this.deleteDestinations();
        },
        () => (this.loading = false)
      );
  }

  onConfirm(): void {
    this.loading = true;
    this.deleteDestinations();
  }
}
