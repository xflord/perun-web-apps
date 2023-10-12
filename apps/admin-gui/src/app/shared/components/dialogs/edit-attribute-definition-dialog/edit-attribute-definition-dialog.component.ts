import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttributeRightsService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import {
  AttributeAction,
  AttributeDefinition,
  AttributePolicyCollection,
  AttributesManagerService,
  Service,
  ServicesManagerService,
} from '@perun-web-apps/perun/openapi';
import { slideInOutLeft, slideInOutRight, switchAnimation } from '@perun-web-apps/perun/animations';
import { AttributeForExportData } from '@perun-web-apps/perun/models';
import { TABLE_ENTITYLESS_ATTRIBUTE_KEYS } from '@perun-web-apps/config/table-config';
import { Clipboard } from '@angular/cdk/clipboard';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';

export interface EditAttributeDefinitionDialogData {
  attDef: AttributeDefinition;
}

@Component({
  selector: 'app-edit-attribute-definition-dialog',
  templateUrl: './edit-attribute-definition-dialog.component.html',
  styleUrls: ['./edit-attribute-definition-dialog.component.scss'],
  animations: [switchAnimation, slideInOutLeft, slideInOutRight],
})
export class EditAttributeDefinitionDialogComponent implements OnInit {
  tableId = TABLE_ENTITYLESS_ATTRIBUTE_KEYS;
  loading = false;
  showKeys = false;
  attDef: AttributeDefinition = this.data.attDef;
  initReadOperations: boolean;
  initReadGlobal: boolean;
  initWriteOperations: boolean;
  initWriteGlobal: boolean;
  finalReadOperations: boolean;
  finalReadGlobal: boolean;
  finalWriteOperations: boolean;
  finalWriteGlobal: boolean;
  attributeControl = this.formBuilder.group({
    name: [this.attDef.displayName, Validators.required],
    description: [this.attDef.description, Validators.required],
  });
  urn = `${this.attDef.namespace}:${this.attDef.friendlyName}`;
  collections$ = new BehaviorSubject<AttributePolicyCollection[]>([]);
  services$: Observable<Service[]> = this.serviceService
    .getServicesByAttributeDefinition(this.attDef.id)
    .pipe(startWith([]));

  constructor(
    public dialogRef: MatDialogRef<EditAttributeDefinitionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditAttributeDefinitionDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private clipboard: Clipboard,
    private attributesManager: AttributesManagerService,
    private serviceService: ServicesManagerService,
    private formBuilder: FormBuilder,
    private attributeRightsService: AttributeRightsService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.dialogRef.addPanelClass('mat-dialog-height-transition');
    this.attributesManager.getAttributeRules(this.attDef.id).subscribe((attrRights) => {
      this.collections$ = new BehaviorSubject(attrRights.attributePolicyCollections);
      this.initReadOperations = 'READ' in attrRights.criticalActions;
      this.initWriteOperations = 'WRITE' in attrRights.criticalActions;
      this.initReadGlobal = attrRights.criticalActions['READ'] || false;
      this.initWriteGlobal = attrRights.criticalActions['WRITE'] || false;
      this.loading = false;
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.updateAttribute();
    this.attributesManager
      .updateAttributeDefinition({ attributeDefinition: this.attDef })
      .pipe(
        switchMap(() => of(this.collections$.getValue())),
        this.attributeRightsService.filterNullInPolicy(),
        switchMap((collections) =>
          this.attributesManager.setAttributePolicyCollections({ policyCollections: collections })
        ),
        switchMap(() =>
          this.attributeRightsService.updateAttributeAction(
            this.finalReadOperations,
            this.initReadOperations,
            this.finalReadGlobal,
            this.initReadGlobal,
            this.attDef.id,
            AttributeAction.READ
          )
        ),
        switchMap(() =>
          this.attributeRightsService.updateAttributeAction(
            this.finalWriteOperations,
            this.initWriteOperations,
            this.finalWriteGlobal,
            this.initWriteGlobal,
            this.attDef.id,
            AttributeAction.WRITE
          )
        )
      )
      .subscribe({
        next: () => {
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.EDIT_ATTRIBUTE_DEFINITION.SUCCESS') as string
          );
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading = false;
          console.error(err);
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  switchShowKeys(): void {
    this.showKeys = !this.showKeys;
    if (this.showKeys) {
      this.dialogRef.updateSize('800px');
    } else {
      this.dialogRef.updateSize('700px');
    }
  }

  copyUrn(): void {
    const success = this.clipboard.copy(this.urn);
    if (success) {
      this.notificator.showSuccess(
        this.translate.instant('DIALOGS.EDIT_ATTRIBUTE_DEFINITION.COPIED') as string
      );
    } else {
      this.notificator.showError(
        this.translate.instant('DIALOGS.EDIT_ATTRIBUTE_DEFINITION.COPY_FAILED') as string
      );
    }
  }

  onCopy(): void {
    this.updateAttribute();
    const data: AttributeForExportData = {
      attributeDefinition: this.attDef,
      attributeRights: this.collections$.getValue(),
    };
    const success = this.clipboard.copy(JSON.stringify(data));
    if (success) {
      this.notificator.showSuccess(
        this.translate.instant('DIALOGS.EDIT_ATTRIBUTE_DEFINITION.COPIED') as string
      );
    } else {
      this.notificator.showError(
        this.translate.instant('DIALOGS.EDIT_ATTRIBUTE_DEFINITION.COPY_FAILED') as string
      );
    }
  }

  private updateAttribute(): void {
    this.attDef.displayName = this.attributeControl.value.name;
    this.attDef.description = this.attributeControl.value.description;
  }
}
