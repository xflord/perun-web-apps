import { Component } from '@angular/core';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { MatDialogRef } from '@angular/material/dialog';
import { AttributeForExportData } from '@perun-web-apps/perun/models';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-attribute-import-dialog',
  templateUrl: './attribute-import-dialog.component.html',
  styleUrls: ['./attribute-import-dialog.component.scss'],
})
export class AttributeImportDialogComponent {
  value = '';
  loading = false;
  private attributeData: AttributeForExportData;

  constructor(
    public dialogRef: MatDialogRef<AttributeImportDialogComponent>,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private attributesManager: AttributesManagerService
  ) {}

  create(): void {
    try {
      this.loading = true;
      this.attributeData = JSON.parse(this.value) as AttributeForExportData;
      this.attributesManager
        .createAttributeDefinition({ attribute: this.attributeData.attributeDefinition })
        .subscribe(
          (attrDef) => {
            // we have to update the attribute id of the attribute rights
            for (const item of this.attributeData.attributeRights) {
              item.attributeId = attrDef.id;
            }
            this.attributesManager
              .setAttributeRights({ rights: this.attributeData.attributeRights })
              .subscribe(() => {
                this.notificator.showSuccess(
                  this.translate.instant('DIALOGS.IMPORT_ATTRIBUTE_DEFINITION.SUCCESS') as string
                );
                this.dialogRef.close(true);
              });
          },
          () => (this.loading = false)
        );
    } catch (e) {
      this.notificator.showError(e as string);
      this.loading = false;
    }
  }
}
