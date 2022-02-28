import { Component, Inject, OnInit } from '@angular/core';
import { AttributeDefinition, ServicesManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';

export interface RemoveRequiredAttributesDialogData {
  serviceId: number;
  attrDefinitions: AttributeDefinition[];
  theme: string;
}

@Component({
  selector: 'app-remove-required-attributes',
  templateUrl: './remove-required-attributes-dialog.component.html',
  styleUrls: ['./remove-required-attributes-dialog.component.scss'],
})
export class RemoveRequiredAttributesDialogComponent implements OnInit {
  theme: string;
  serviceId: number;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<AttributeDefinition>;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<RemoveRequiredAttributesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: RemoveRequiredAttributesDialogData,
    public serviceManager: ServicesManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.serviceId = this.data.serviceId;
    this.dataSource = new MatTableDataSource<AttributeDefinition>(this.data.attrDefinitions);
  }

  onConfirm(): void {
    this.loading = true;
    const attrDefinitionsIds = this.dataSource.data.map((attrDef) => attrDef.id);

    this.serviceManager.removeRequiredAttributes(this.serviceId, attrDefinitionsIds).subscribe(
      () => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.REMOVE_REQUIRED_ATTRIBUTES.SUCCESS') as string
        );
        this.dialogRef.close(true);
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
