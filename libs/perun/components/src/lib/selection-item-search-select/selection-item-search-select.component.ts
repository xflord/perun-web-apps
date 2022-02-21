import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AttributeDefinition } from '@perun-web-apps/perun/openapi';

export class SelectionItem {
  value: string;
  displayName: string;

  constructor(displayName: string, value: string) {
    this.value = value;
    this.displayName = displayName;
  }
}

export enum ItemType {
  SOURCE,
  DESTINATION,
  FEDERATION,
}

@Component({
  selector: 'perun-web-apps-selection-item-search-select',
  templateUrl: './selection-item-search-select.component.html',
  styleUrls: ['./selection-item-search-select.component.scss'],
})
export class SelectionItemSearchSelectComponent implements OnInit {
  constructor(private translateService: TranslateService) {}

  @Input()
  attributes: AttributeDefinition[] = [];

  @Input()
  selectedAttribute: string;

  @Input()
  type: ItemType;

  @Input()
  asGroup = false;

  @Output()
  itemSelected = new EventEmitter<SelectionItem>();

  items: SelectionItem[] = [];
  item: SelectionItem;

  private static getDefinition(attribute: AttributeDefinition) {
    const temp = attribute.namespace.split(':');
    if (temp[4] === null) {
      return 'null';
    }
    return temp[4];
  }

  ngOnInit(): void {
    if (this.type === ItemType.FEDERATION) {
      this.getFederationAttributes();
      this.getFederationAttribute();
    } else {
      this.createSelectionItems();
    }
    this.sortAttributes(this.items);
  }

  nameFunction = (item: SelectionItem) => item.displayName;
  shortNameFunction = () => null;
  searchFunction = (item: SelectionItem) => item.displayName;

  createSelectionItems() {
    this.translateService
      .get('DIALOGS.APPLICATION_FORM_EDIT_ITEM.NO_SELECTED_ITEM')
      .subscribe((noItem) => {
        const emptyItem: SelectionItem = new SelectionItem(noItem, '');
        this.items.push(emptyItem);
        this.item = emptyItem;
      });

    for (const attribute of this.attributes) {
      const item: SelectionItem = new SelectionItem(
        attribute.friendlyName +
          ' (' +
          attribute.entity +
          ' / ' +
          SelectionItemSearchSelectComponent.getDefinition(attribute) +
          ')',
        attribute.namespace + ':' + attribute.friendlyName
      );
      if (item.value === this.selectedAttribute) {
        this.item = item;
      }

      if (
        attribute.entity.toLowerCase() === 'user' ||
        attribute.entity.toLowerCase() === 'member'
      ) {
        // add only member and user attributes
        this.items.push(item);
      } else if (attribute.entity.toLowerCase() === 'vo' && this.type === ItemType.SOURCE) {
        // source attributes can be VO too
        this.items.push(item);
      } else if (
        attribute.entity.toLowerCase() === 'group' &&
        this.asGroup &&
        this.type === ItemType.SOURCE
      ) {
        // if dialog is for group
        this.items.push(item);
      }
    }
  }

  getFederationAttributes() {
    this.translateService
      .get('DIALOGS.APPLICATION_FORM_EDIT_ITEM.NO_SELECTED_ITEM')
      .subscribe((noItem) => {
        this.items.push(new SelectionItem(noItem, ''));
        this.translateService
          .get('DIALOGS.APPLICATION_FORM_EDIT_ITEM.CUSTOM_VALUE')
          .subscribe((custom) => {
            this.items.push(new SelectionItem(custom, 'custom'));
            this.items.push(new SelectionItem('Display name', 'displayName'));
            this.items.push(new SelectionItem('Common name', 'cn'));
            this.items.push(new SelectionItem('Mail', 'mail'));
            this.items.push(new SelectionItem('Organization', 'o'));
            this.items.push(new SelectionItem('Level of Assurance (LoA)', 'loa'));
            this.items.push(new SelectionItem('First name', 'givenName'));
            this.items.push(new SelectionItem('Surname', 'sn'));
            this.items.push(new SelectionItem('EPPN', 'eppn'));
            this.items.push(new SelectionItem('IdP Category', 'md_entityCategory'));
            this.items.push(new SelectionItem('IdP Affiliation', 'affiliation'));
            this.items.push(
              new SelectionItem('EduPersonScopedAffiliation', 'eduPersonScopedAffiliation')
            );
            this.items.push(
              new SelectionItem('Forwarded Affiliation from Proxy', 'forwardedScopedAffiliation')
            );
            this.items.push(new SelectionItem('schacHomeOrganization', 'schacHomeOrganization'));
            this.items.push(new SelectionItem('Login', 'uid'));
            this.items.push(new SelectionItem('Alternative login name', 'alternativeLoginName'));
          });
      });
  }

  getFederationAttribute() {
    for (const item of this.items) {
      if (item.value === this.selectedAttribute) {
        this.item = item;
        return;
      }
    }
    // get correct custom value
    this.item = this.items[1];
    this.item.value = this.selectedAttribute;
  }

  sortAttributes(attributes: SelectionItem[]) {
    attributes.sort((a: SelectionItem, b: SelectionItem) => {
      if (a.value === '') {
        return -1;
      }
      if (b.value === '') {
        return 1;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }
}
