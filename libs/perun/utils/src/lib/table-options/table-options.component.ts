import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExportTableDialogComponent } from '../export-table-dialog/export-table-dialog.component';
import { getDefaultDialogConfig } from '../perun-utils';

interface DialogData {
  exportType: string;
  format: string;
}

@Component({
  selector: 'perun-web-apps-table-options',
  templateUrl: './table-options.component.html',
  styleUrls: ['./table-options.component.scss'],
})
export class TableOptionsComponent {
  @Input() allowExportAll: boolean;
  @Output() exportDisplayedData = new EventEmitter<string>();
  @Output() exportAllData = new EventEmitter<string>();

  constructor(private dialog: MatDialog) {}
  openDialog(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      allowExportAll: this.allowExportAll,
    };
    this.dialog
      .open(ExportTableDialogComponent, config)
      .afterClosed()
      .subscribe((result: DialogData) => {
        if (result) {
          if (result.exportType === 'all') {
            this.exportAllData.emit(result.format);
          } else {
            this.exportDisplayedData.emit(result.format);
          }
        }
      });
  }
}
