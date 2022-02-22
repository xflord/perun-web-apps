import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Service } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-service-search-select',
  templateUrl: './service-search-select.component.html',
  styleUrls: ['./service-search-select.component.scss'],
})
export class ServiceSearchSelectComponent {
  @Input() service: Service = null;
  @Input() services: Service[];
  @Input() multiple = false;
  @Input() disableAutoSelect = false;
  @Input() theme = '';
  @Output() serviceSelected = new EventEmitter<Service>();

  nameFunction = (service: Service): string => service.name;
  secondaryFunction = (): string => '';
  searchFunction = (service: Service): string => service.name;
}
