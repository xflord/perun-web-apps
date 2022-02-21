import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationFormItem, AppType, Group, Type } from '@perun-web-apps/perun/openapi';
import { AttributeDefinition, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { createNewApplicationFormItem } from '@perun-web-apps/perun/utils';
import DisabledEnum = ApplicationFormItem.DisabledEnum;
import HiddenEnum = ApplicationFormItem.HiddenEnum;
import { ItemType, NO_FORM_ITEM, SelectionItem } from '@perun-web-apps/perun/components';
import { StoreService } from '@perun-web-apps/perun/services';

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
  attributeDefinitions: AttributeDefinition[];
  federationAttributeDN = '';
  itemType = ItemType;
  options: { [key: string]: [string, string][] };
  theme: string;
  loading = false;
  hiddenValues: HiddenEnum[] = ['NEVER', 'ALWAYS', 'IF_EMPTY', 'IF_PREFILLED'];
  disabledValues: DisabledEnum[] = ['NEVER', 'ALWAYS', 'IF_EMPTY', 'IF_PREFILLED'];
  possibleDependencyItems: ApplicationFormItem[] = [];

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
  ];

  hiddenDependencyItem: ApplicationFormItem = null;
  disabledDependencyItem: ApplicationFormItem = null;
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

  languages = ['en'];

  constructor(
    private dialogRef: MatDialogRef<EditApplicationFormItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditApplicationFormItemDialogComponentData,
    private attributesManager: AttributesManagerService,
    private translateService: TranslateService,
    private store: StoreService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.languages = this.store.get('supported_languages');
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
    this.loading = true;
    this.attributesManager.getAllAttributeDefinitions().subscribe(
      (attributeDefinitions) => {
        this.attributeDefinitions = attributeDefinitions;
        this.loading = false;
      },
      () => (this.loading = false)
    );
    if (this.applicationFormItem.perunDestinationAttribute === null) {
      this.applicationFormItem.perunDestinationAttribute = '';
    }
    if (this.applicationFormItem.perunSourceAttribute === null) {
      this.applicationFormItem.perunSourceAttribute = '';
    }
    this.getOptions();
  }

  private getPossibleDepItems() {
    return [NO_FORM_ITEM].concat(
      this.data.allItems
        .filter((item) => this.dependencyTypes.indexOf(item.type) > -1)
        .filter((item) => item.id !== this.data.applicationFormItem.id)
    );
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.applicationFormItem.hiddenDependencyItemId =
      this.hiddenDependencyItem === NO_FORM_ITEM ? null : this.hiddenDependencyItem.id;
    this.applicationFormItem.disabledDependencyItemId =
      this.disabledDependencyItem === NO_FORM_ITEM ? null : this.disabledDependencyItem.id;
    this.updateOptions();
    this.copy(this.applicationFormItem, this.data.applicationFormItem);
    this.dialogRef.close(true);
  }

  onChangingType(type: AppType) {
    if (this.applicationFormItem.applicationTypes.includes(type)) {
      const index = this.applicationFormItem.applicationTypes.indexOf(type);
      this.applicationFormItem.applicationTypes.splice(index, 1);
    } else {
      this.applicationFormItem.applicationTypes.push(type);
    }
  }

  addOption(lang: string) {
    this.options[lang].push(['', '']);
  }

  removeOption(option: [string, string], lang: string) {
    this.options[lang] = this.options[lang].filter(
      (opt) => !(opt[0] === option[0] && opt[1] === option[1])
    );
  }

  updateOption(lang: string) {
    let options = '';
    if (this.options && this.options[lang]) {
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

  updateOptions() {
    for (const lang of this.languages) {
      this.updateOption(lang);
    }
  }

  changeFederationAttribute(fedAttribute: SelectionItem) {
    this.applicationFormItem.federationAttribute = fedAttribute.value;
    this.federationAttributeDN = fedAttribute.displayName;
    this.cd.detectChanges();
  }

  copy(from: ApplicationFormItem, to: ApplicationFormItem) {
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

  sortOptionsAZ(lang: string) {
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

  sortOptionsZA(lang: string) {
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

  private getOptions() {
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

  isApplicationFormItemOfType(types: string[]): boolean {
    return types.indexOf(this.applicationFormItem.type) > -1;
  }
}
