import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  AttributeDefinition,
  AttributePolicyCollection,
  AttributesManagerService,
} from '@perun-web-apps/perun/openapi';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BehaviorSubject, of, zip } from 'rxjs';
import { AttributeRightsService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import {
  AttributeDefinitionType,
  AttributeEntity,
  AttributeForm,
  AttributeValueType,
} from '@perun-web-apps/perun/models';
import { DisableUniqueAttributePipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'app-create-attribute-definition-dialog',
  templateUrl: './create-attribute-definition-dialog.component.html',
  styleUrls: ['./create-attribute-definition-dialog.component.scss'],
  providers: [DisableUniqueAttributePipe],
})
export class CreateAttributeDefinitionDialogComponent {
  loading = false;
  attributeControl = this.formBuilder.group({
    friendlyName: ['', Validators.required],
    displayName: ['', Validators.required],
    description: ['', Validators.required],
    entity: ['', Validators.required],
    definitionType: ['', Validators.required],
    valueType: ['', Validators.required],
  });
  entities: AttributeEntity[] = [
    'facility',
    'resource',
    'group',
    'group_resource',
    'host',
    'member',
    'member_group',
    'member_resource',
    'user',
    'ues',
    'user_facility',
    'vo',
    'entityless',
  ];
  definitionTypes: AttributeDefinitionType[] = ['def', 'opt', 'virt', 'core'];
  valueTypes: AttributeValueType[] = [
    'java.lang.String',
    'java.lang.Integer',
    'java.lang.Boolean',
    'java.util.Array',
    'java.util.LinkedHashMap',
  ];
  attDef = new BehaviorSubject<AttributeDefinition>({
    id: 0,
    beanName: '',
    namespace: '',
    unique: false,
  });
  collections: AttributePolicyCollection[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreateAttributeDefinitionDialogComponent>,
    private formBuilder: FormBuilder,
    private attributeService: AttributesManagerService,
    private attributeRightsService: AttributeRightsService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private uniqueAttPipe: DisableUniqueAttributePipe
  ) {
    this.attributeControl.valueChanges.pipe(debounceTime(200)).subscribe((value: AttributeForm) => {
      this.setAttribute(value);
    });
  }

  submit(): void {
    this.loading = true;
    this.attributeService
      .createAttributeDefinition({ attribute: this.attDef.getValue() })
      .pipe(
        switchMap((attDef) => zip(of(attDef.id), of(this.collections))),
        this.attributeRightsService.addAttributeId(),
        this.attributeRightsService.filterNullInPolicy(),
        switchMap((collections) =>
          this.attributeService.setAttributePolicyCollections({ policyCollections: collections })
        )
      )
      .subscribe(
        () => {
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.CREATE_ATTRIBUTE_DEFINITION.SUCCESS') as string
          );
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private setAttribute(value: AttributeForm): void {
    const newAtt: AttributeDefinition = {
      id: 0,
      beanName: '',
      friendlyName: value.friendlyName,
      displayName: value.displayName,
      description: value.description,
      type: value.valueType,
      namespace: this.createNamespace(value.entity, value.definitionType),
    };
    newAtt.unique = this.attDef.getValue().unique && !this.uniqueAttPipe.transform(newAtt);
    this.attDef.next(newAtt);
  }

  private createNamespace(entity: AttributeEntity, def: AttributeDefinitionType): string {
    return 'urn:perun:' + entity + ':attribute-def:' + def;
  }
}
