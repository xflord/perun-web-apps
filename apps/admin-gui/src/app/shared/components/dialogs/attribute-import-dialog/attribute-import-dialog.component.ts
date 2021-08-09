import { Component } from '@angular/core';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { MatDialogRef } from '@angular/material/dialog';
import { AttributeForExportData } from '@perun-web-apps/perun/models';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-attribute-import-dialog',
  templateUrl: './attribute-import-dialog.component.html',
  styleUrls: ['./attribute-import-dialog.component.scss']
})
export class AttributeImportDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AttributeImportDialogComponent>,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private attributesManager: AttributesManagerService
  ) { }

  value = "";
  attributeData: AttributeForExportData;
  loading = false

  create() {
    try {
      this.loading = true;
      this.attributeData = JSON.parse(this.value);
      this.attributesManager.createAttributeDefinition({attribute: this.attributeData.attributeDefinition})
          .subscribe(attrDef => {
        // we have to update the attribute id of the attribute rights
        for (let i = 0; i < this.attributeData.attributeRights.length; i++) {
          this.attributeData.attributeRights[i].attributeId = attrDef.id;
        }
        this.attributesManager.setAttributeRights({rights: this.attributeData.attributeRights}).subscribe(() => {
          this.notificator.showSuccess(this.translate.instant('DIALOGS.IMPORT_ATTRIBUTE_DEFINITION.SUCCESS'));
          this.dialogRef.close(true);
        });
      }, () => this.loading = false);
    } catch (e) {
      console.log(e);
      this.notificator.showError(e);
      this.loading = false;
    }
  }
}
