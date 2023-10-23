import { Component, Inject, OnInit } from '@angular/core';
import { RichDestination, ServicesManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';

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
    private translate: PerunTranslateService,
    private serviceManager: ServicesManagerService,
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
    this.serviceManager
      .removeDestinationsByRichDestinations({ richDestinations: this.destinations })
      .subscribe({
        next: () => {
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.REMOVE_DESTINATIONS.SUCCESS'),
          );
          this.dialogRef.close(true);
        },
        error: () => (this.loading = false),
      });
  }

  onConfirm(): void {
    this.loading = true;
    this.deleteDestinations();
  }
}
