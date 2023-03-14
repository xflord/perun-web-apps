import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { GlobalNamespacePipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'perun-web-apps-namespace-search-select',
  templateUrl: './namespace-search-select.component.html',
  styleUrls: ['./namespace-search-select.component.scss'],
  providers: [GlobalNamespacePipe],
})
export class NamespaceSearchSelectComponent implements OnChanges {
  @Input() namespace: string;
  @Input() namespaceOptions: string[];
  @Input() disableAutoSelect = false;
  @Input() multiple = false;
  @Input() disableDeselectButton = false;
  @Input() customSelectPlaceholder: string;
  @Input() customFindPlaceholder: string;

  @Output() namespaceSelected = new EventEmitter<string[] | string>();
  @Output() selectClosed = new EventEmitter<boolean>();

  constructor(private globalNamespacePipe: GlobalNamespacePipe) {}

  searchFunction = (entity: string): string => entity;
  mainTextFunction = (entity: string): string => this.globalNamespacePipe.transform(entity);
  secondaryTextFunction = (): string => '';

  ngOnChanges(): void {
    if (!this.namespace && !this.disableAutoSelect) {
      this.namespace = this.namespaceOptions[0];
    }
  }
}
