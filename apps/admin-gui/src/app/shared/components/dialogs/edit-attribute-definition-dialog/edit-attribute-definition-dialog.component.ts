import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttributeRightsService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import {
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
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

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
  attributeControl: UntypedFormGroup = this.formBuilder.group({
    name: [this.attDef.displayName, Validators.required],
    description: [this.attDef.description, Validators.required],
  });
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
    private formBuilder: UntypedFormBuilder,
    private attributeRightsService: AttributeRightsService
  ) {}

  ngOnInit(): void {
    this.dialogRef.addPanelClass('mat-dialog-height-transition');
    this.attributesManager
      .getAttributePolicyCollections(this.attDef.id)
      .subscribe(this.collections$);
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
        )
      )
      .subscribe(
        () => {
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.EDIT_ATTRIBUTE_DEFINITION.SUCCESS') as string
          );
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
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
    this.attDef.displayName = this.attributeControl.get('name').value as string;
    this.attDef.description = this.attributeControl.get('description').value as string;
  }
}
