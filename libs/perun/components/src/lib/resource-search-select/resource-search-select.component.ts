import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Resource } from '@perun-web-apps/perun/openapi';
import { compareFnName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-resource-search-select',
  templateUrl: './resource-search-select.component.html',
  styleUrls: ['./resource-search-select.component.css'],
})
export class ResourceSearchSelectComponent implements OnInit {
  @Input() resource: Resource = null;
  @Input() resources: Resource[];
  @Input() displayStatus = true;
  @Output() resourceSelected = new EventEmitter<Resource>();

  nameFunction = (resource: Resource): string => resource.name;
  secondaryFunction = (): string => null;

  ngOnInit(): void {
    this.resources = this.resources.sort(compareFnName);
  }
}
