import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-string-search-select',
  templateUrl: './string-search-select.component.html',
  styleUrls: ['./string-search-select.component.scss'],
})
export class StringSearchSelectComponent {
  @Input() values: string[];
  @Input() preselectedValues: string[];
  @Input() selectPlaceholder: string;
  @Input() mainTextFunction: (string) => string;
  @Input() disableDeselectButton = false;
  @Output() valueSelection = new EventEmitter<string[]>();
  @Output() selectClosed = new EventEmitter<boolean>();

  defaultTextFunction = (entity: string): string => entity;
  secondaryTextFunction = (): string => '';
}
