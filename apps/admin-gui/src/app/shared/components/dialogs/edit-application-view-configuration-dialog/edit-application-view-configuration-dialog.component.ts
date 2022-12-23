import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AttributesManagerService } from "@perun-web-apps/perun/openapi";
import { TranslateService } from "@ngx-translate/core";
import { NotificatorService } from "@perun-web-apps/perun/services";

export interface EditApplicationViewConfigurationDialogData {
  displayedColumns: string[];
  possibleColumns: string[];
  entity: "vo" | "group";
  id: number;
  theme: string;
}

@Component({
  selector: 'app-edit-application-view-configuration-dialog',
  templateUrl: './edit-application-view-configuration-dialog.component.html',
  styleUrls: ['./edit-application-view-configuration-dialog.component.scss'],
})
export class EditApplicationViewConfigurationDialogComponent implements OnInit {
    loading = false;
    theme: string;

  constructor(
    private dialogRef: MatDialogRef<EditApplicationViewConfigurationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditApplicationViewConfigurationDialogData,
    private attributesManager: AttributesManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
