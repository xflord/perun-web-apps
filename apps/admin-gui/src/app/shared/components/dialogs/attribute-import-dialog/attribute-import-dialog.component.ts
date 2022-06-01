import { Component } from '@angular/core';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { MatDialogRef } from '@angular/material/dialog';
import { AttributeForExportData } from '@perun-web-apps/perun/models';
import { AttributeRightsService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { of, zip } from 'rxjs';

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
    private attributesManager: AttributesManagerService,
    private attributesRightsService: AttributeRightsService
  ) {}

  create(): void {
    this.loading = true;
    this.attributeData = JSON.parse(this.value) as AttributeForExportData;
    this.attributesManager
      .createAttributeDefinition({ attribute: this.attributeData.attributeDefinition })
      .pipe(
        switchMap((attDef) => zip(of(attDef.id), of(this.attributeData.attributeRights))),
        this.attributesRightsService.addAttributeId(),
        switchMap((collections) =>
          this.attributesManager.setAttributePolicyCollections({ policyCollections: collections })
        )
      )
      .subscribe(
        () => {
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.IMPORT_ATTRIBUTE_DEFINITION.SUCCESS') as string
          );
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
  }
}
