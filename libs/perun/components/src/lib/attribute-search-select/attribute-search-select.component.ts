import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AttributeDefinition } from '@perun-web-apps/perun/openapi';
import { compareFnDisplayName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-attribute-search-select',
  templateUrl: './attribute-search-select.component.html',
  styleUrls: ['./attribute-search-select.component.scss'],
})
export class AttributeSearchSelectComponent implements OnInit, OnChanges {
  @Input() attributes: AttributeDefinition[];
  @Input() attributesForEntity: 'user' | 'facility' | 'resource';
  @Output() attributeSelected = new EventEmitter<AttributeDefinition>();
  @Output() search = new EventEmitter<{ [p: string]: string }>();

  availableAttrDefs: AttributeDefinition[] = [];
  options: string[][] = [];

  nameFunction = (attr: AttributeDefinition) => attr.displayName;
  secondaryTextFunction: (attr: AttributeDefinition) => string = (attr) => '#' + attr.id;

  ngOnInit() {
    this.availableAttrDefs = this.attributes
      .filter((attrDef) => attrDef.entity === this.attributesForEntity)
      .sort(compareFnDisplayName);
  }

  ngOnChanges(): void {
    this.options = [];
    this.options.push([this.attributes[0].namespace + ':' + this.attributes[0].friendlyName, '']);
  }

  removeOption(option: string[]) {
    this.options = this.options.filter((opt) => opt !== option);
  }

  addOption(): void {
    this.options.push([this.attributes[0].namespace + ':' + this.attributes[0].friendlyName, '']);
  }

  emptySearchString(): boolean {
    return this.options.some((opt) => opt[1].length === 0);
  }

  searchEntities() {
    const inputGetEntity: { [p: string]: string } = {};
    this.options.forEach((search) => {
      inputGetEntity[search[0]] = search[1];
    });
    this.search.emit(inputGetEntity);
  }
}
