import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ServicesPackage, Vo } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-service-package-search-select',
  templateUrl: './service-package-search-select.component.html',
  styleUrls: ['./service-package-search-select.component.scss']
})
export class ServicePackageSearchSelectComponent {

  constructor() { }

  @Input()
  servicePackages: ServicesPackage[] = [];

  @Output()
  packageSelected = new EventEmitter<ServicesPackage>();

  nameFunction = (servicePackages: ServicesPackage) => servicePackages.name;
  shortNameFunction = (servicePackages: ServicesPackage) => servicePackages.description;
  searchFunction = (servicePackages: ServicesPackage) => servicePackages.name + servicePackages.description;

}
