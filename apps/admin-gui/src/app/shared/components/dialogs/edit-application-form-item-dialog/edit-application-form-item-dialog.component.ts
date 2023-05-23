import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  ApplicationFormItem,
  AppType,
  AttributeDefinition,
  AttributesManagerService,
  Group,
  Type,
} from '@perun-web-apps/perun/openapi';
import { createNewApplicationFormItem } from '@perun-web-apps/perun/utils';
import DisabledEnum = ApplicationFormItem.DisabledEnum;
import HiddenEnum = ApplicationFormItem.HiddenEnum;
import { ItemType, NO_FORM_ITEM, SelectionItem } from '@perun-web-apps/perun/components';
import { HtmlEscapeService, StoreService } from '@perun-web-apps/perun/services';
import { FormControl, FormGroup } from '@angular/forms';

export interface EditApplicationFormItemDialogComponentData {
  theme: string;
  voId: number;
  group: Group;
  applicationFormItem: ApplicationFormItem;
  allItems: ApplicationFormItem[];
}

@Component({
  selector: 'app-edit-application-form-item-dialog',
  templateUrl: './edit-application-form-item-dialog.component.html',
  styleUrls: ['./edit-application-form-item-dialog.component.scss'],
})
export class EditApplicationFormItemDialogComponent implements OnInit {
  applicationFormItem: ApplicationFormItem;
  sourceAttributes: AttributeDefinition[];
  destinationAttributes: AttributeDefinition[];
  federationAttributeDN = '';
  itemType = ItemType;
  options: { [key: string]: [string, string][] };
  theme: string;
  loading = false;
  hiddenValues: HiddenEnum[] = ['NEVER', 'ALWAYS', 'IF_EMPTY', 'IF_PREFILLED'];
  disabledValues: DisabledEnum[] = ['NEVER', 'ALWAYS', 'IF_EMPTY', 'IF_PREFILLED'];
  possibleDependencyItems: ApplicationFormItem[] = [];
  inputFormGroup: FormGroup<Record<string, FormControl<string>>> = null;

  typesWithUpdatable: Type[] = [
    'VALIDATED_EMAIL',
    'TEXTFIELD',
    'TEXTAREA',
    'CHECKBOX',
    'RADIO',
    'SELECTIONBOX',
    'COMBOBOX',
    'TIMEZONE',
  ];
  typesWithDisabled: Type[] = [
    'USERNAME',
    'PASSWORD',
    'VALIDATED_EMAIL',
    'TEXTFIELD',
    'TEXTAREA',
    'CHECKBOX',
    'RADIO',
    'SELECTIONBOX',
    'COMBOBOX',
    'LIST_INPUT_BOX',
    'MAP_INPUT_BOX',
  ];

  hiddenDependencyItem: ApplicationFormItem = null;
  disabledDependencyItem: ApplicationFormItem = null;
  languages = ['en'];
  private dependencyTypes: Type[] = [
    'PASSWORD',
    'VALIDATED_EMAIL',
    'TEXTFIELD',
    'TEXTAREA',
    'CHECKBOX',
    'RADIO',
    'SELECTIONBOX',
    'COMBOBOX',
    'USERNAME',
  ];

  constructor(
    private dialogRef: MatDialogRef<EditApplicationFormItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditApplicationFormItemDialogComponentData,
    private attributesManager: AttributesManagerService,
    private translateService: TranslateService,
    private store: StoreService,
    private cd: ChangeDetectorRef,
    private escapeService: HtmlEscapeService
  ) {}

  ngOnInit(): void {
    this.languages = this.store.getProperty('supported_languages');
    this.hiddenDependencyItem = this.data.allItems.find(
      (item) => item.id === this.data.applicationFormItem.hiddenDependencyItemId
    );
    if (!this.hiddenDependencyItem) {
      this.hiddenDependencyItem = NO_FORM_ITEM;
    }
    this.disabledDependencyItem = this.data.allItems.find(
      (item) => item.id === this.data.applicationFormItem.disabledDependencyItemId
    );
    if (!this.disabledDependencyItem) {
      this.disabledDependencyItem = NO_FORM_ITEM;
    }
    this.theme = this.data.theme;
    this.possibleDependencyItems = this.getPossibleDepItems();
    this.applicationFormItem = createNewApplicationFormItem(this.languages);
    this.copy(this.data.applicationFormItem, this.applicationFormItem);
    this.prepareFormControls();
    this.loading = true;
    this.attributesManager.getAllAttributeDefinitions().subscribe({
      next: (attributeDefinitions) => {
        const filteredAttributes = this.filterAttributesForWidget(attributeDefinitions);

        const perunSourceAttrDef = this.findAttribute(
          attributeDefinitions,
          this.applicationFormItem.perunSourceAttribute
        );
        this.sourceAttributes = perunSourceAttrDef
          ? filteredAttributes.concat(perunSourceAttrDef)
          : filteredAttributes;

        const perunDestinationAttrDef = this.findAttribute(
          attributeDefinitions,
          this.applicationFormItem.perunDestinationAttribute
        );
        this.destinationAttributes = perunDestinationAttrDef
          ? filteredAttributes.concat(perunDestinationAttrDef)
          : filteredAttributes;

        this.loading = false;
      },
      error: () => (this.loading = false),
    });
    if (this.applicationFormItem.perunDestinationAttribute === null) {
      this.applicationFormItem.perunDestinationAttribute = '';
    }
    if (this.applicationFormItem.perunSourceAttribute === null) {
      this.applicationFormItem.perunSourceAttribute = '';
    }
    this.getOptions();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.applicationFormItem.hiddenDependencyItemId =
      this.hiddenDependencyItem === NO_FORM_ITEM ? null : this.hiddenDependencyItem.id;
    this.applicationFormItem.disabledDependencyItemId =
      this.disabledDependencyItem === NO_FORM_ITEM ? null : this.disabledDependencyItem.id;

    for (const lang of this.languages) {
      // check if (forbidden) input should be escaped
      if (
        this.applicationFormItem.type === 'HTML_COMMENT' ||
        this.applicationFormItem.type === 'HEADING'
      ) {
        this.applicationFormItem.i18n[lang].label = this.escapeService.escapeDangerousHtml(
          this.inputFormGroup.get(`${lang}-html-label`).value
        ).escapedHtml;
      } else {
        this.applicationFormItem.i18n[lang].label = this.inputFormGroup.get(
          `${lang}-plain-label`
        ).value;
        this.applicationFormItem.i18n[lang].errorMessage = this.inputFormGroup.get(
          `${lang}-plain-error-message`
        ).value;
        this.applicationFormItem.i18n[lang].help = this.inputFormGroup.get(
          `${lang}-plain-help`
        ).value;
      }
    }

    this.updateOptions();
    this.copy(this.applicationFormItem, this.data.applicationFormItem);
    this.dialogRef.close(true);
  }

  onChangingType(type: AppType): void {
    if (this.applicationFormItem.applicationTypes.includes(type)) {
      const index = this.applicationFormItem.applicationTypes.indexOf(type);
      this.applicationFormItem.applicationTypes.splice(index, 1);
    } else {
      this.applicationFormItem.applicationTypes.push(type);
    }
  }

  addOption(lang: string): void {
    this.options[lang].push(['', '']);
  }

  removeOption(option: [string, string], lang: string): void {
    this.options[lang] = this.options[lang].filter(
      (opt) => !(opt[0] === option[0] && opt[1] === option[1])
    );
  }

  sortOptionsAZ(lang: string): void {
    this.options[lang] = this.options[lang].sort((n1, n2) => {
      if (n1[1] > n2[1]) {
        return 1;
      }

      if (n1[1] < n2[1]) {
        return -1;
      }

      return 0;
    });
  }

  sortOptionsZA(lang: string): void {
    this.options[lang] = this.options[lang].sort((n1, n2) => {
      if (n1[1] > n2[1]) {
        return -1;
      }

      if (n1[1] < n2[1]) {
        return 1;
      }

      return 0;
    });
  }

  isApplicationFormItemOfType(types: string[]): boolean {
    return types.includes(this.applicationFormItem.type);
  }

  changeFederationAttribute(fedAttribute: SelectionItem): void {
    this.applicationFormItem.federationAttribute = fedAttribute.value;
    this.federationAttributeDN = fedAttribute.displayName;
    this.cd.detectChanges();
  }

  copy(from: ApplicationFormItem, to: ApplicationFormItem): void {
    to.applicationTypes = from.applicationTypes;
    to.federationAttribute = from.federationAttribute;
    to.forDelete = from.forDelete;
    for (const lang of this.languages) {
      to.i18n[lang].errorMessage = from.i18n[lang].errorMessage;
      to.i18n[lang].help = from.i18n[lang].help;
      to.i18n[lang].label = from.i18n[lang].label;
      to.i18n[lang].options = from.i18n[lang].options;
    }
    to.id = from.id;
    to.ordnum = from.ordnum;
    to.perunDestinationAttribute = from.perunDestinationAttribute;
    to.perunSourceAttribute = from.perunSourceAttribute;
    to.regex = from.regex;
    to.required = from.required;
    to.shortname = from.shortname;
    to.type = from.type;
    to.updatable = from.updatable;
    to.disabled = from.disabled;
    to.hidden = from.hidden;
    to.disabledDependencyItemId = from.disabledDependencyItemId;
    to.hiddenDependencyItemId = from.hiddenDependencyItemId;
  }

  private prepareFormControls(): void {
    const formGroupFields: { [key: string]: FormControl } = {};
    for (const lang of this.languages) {
      if (
        this.applicationFormItem.type === 'HTML_COMMENT' ||
        this.applicationFormItem.type === 'HEADING'
      ) {
        formGroupFields[`${lang}-html-label`] = new FormControl(
          this.applicationFormItem.i18n[lang].label,
          [this.escapeService.htmlContentValidator()]
        );
        formGroupFields[`${lang}-html-label`].markAsTouched();
      } else {
        // Plain
        formGroupFields[`${lang}-plain-error-message`] = new FormControl(
          this.applicationFormItem.i18n[lang].errorMessage,
          []
        );
        formGroupFields[`${lang}-plain-help`] = new FormControl(
          this.applicationFormItem.i18n[lang].help,
          []
        );
        formGroupFields[`${lang}-plain-label`] = new FormControl(
          this.applicationFormItem.i18n[lang].label,
          []
        );

        formGroupFields[`${lang}-plain-label`].markAsTouched();
        formGroupFields[`${lang}-plain-error-message`].markAsTouched();
        formGroupFields[`${lang}-plain-help`].markAsTouched();
      }
    }
    this.inputFormGroup = new FormGroup(formGroupFields);
  }

  private getOptions(): void {
    this.options = {};
    for (const lang of this.languages) {
      this.options[lang] = [];
      if (this.applicationFormItem.i18n[lang].options) {
        const temp = this.applicationFormItem.i18n[lang].options.split('|');
        for (const item of temp) {
          const line = item.split('#');
          this.options[lang].push([line[0], line[1]]);
        }
      }
    }
  }

  private getPossibleDepItems(): ApplicationFormItem[] {
    return [NO_FORM_ITEM].concat(
      this.data.allItems
        .filter((item) => this.dependencyTypes.includes(item.type))
        .filter((item) => item.id !== this.data.applicationFormItem.id)
    );
  }

  private updateOption(lang: string): void {
    let options = '';
    if (this.options[lang] ?? false) {
      for (const item of this.options[lang]) {
        if (item[0] !== '' && item[1] !== '') {
          if (options === '') {
            options = item[0] + '#' + item[1];
          } else {
            options = options + '|' + item[0] + '#' + item[1];
          }
        }
      }
    }
    this.applicationFormItem.i18n[lang].options = options;
  }

  private updateOptions(): void {
    for (const lang of this.languages) {
      this.updateOption(lang);
    }
  }

  private findAttribute(attributes: AttributeDefinition[], toFind: string): AttributeDefinition {
    return attributes.find((att) => toFind.includes(att.friendlyName));
  }

  private filterAttributesForWidget(attributes: AttributeDefinition[]): AttributeDefinition[] {
    if (this.applicationFormItem.type === 'MAP_INPUT_BOX') {
      return attributes.filter((att) => att.type.includes('LinkedHashMap'));
    } else if (this.applicationFormItem.type === 'LIST_INPUT_BOX') {
      return attributes.filter((att) => att.type.includes('ArrayList'));
    } else {
      return attributes.filter(
        (att) => !att.type.includes('ArrayList') && !att.type.includes('LinkedHashMap')
      );
    }
  }
}
