import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Service } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-service-search-select',
  templateUrl: './service-search-select.component.html',
  styleUrls: ['./service-search-select.component.scss']
})
export class ServiceSearchSelectComponent {

  constructor() { }

  @Input()
  service: Service = null;

  @Input()
  services: Service[];

  @Output()
  serviceSelected = new EventEmitter<Service>();

  nameFunction = (service: Service) => service.name;
  secondaryFunction = () => null;
  searchFunction = (service: Service) => service.name;
}
