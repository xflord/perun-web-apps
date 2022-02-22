import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ServicesPackage } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-service-package-search-select',
  templateUrl: './service-package-search-select.component.html',
  styleUrls: ['./service-package-search-select.component.scss'],
})
export class ServicePackageSearchSelectComponent {
  @Input() servicePackages: ServicesPackage[] = [];
  @Input() selectedPackage: ServicesPackage = null;
  @Input() multiple = false;
  @Input() disableAutoSelect = false;
  @Input() theme = '';
  @Output() packageSelected = new EventEmitter<ServicesPackage>();

  nameFunction = (servicePackages: ServicesPackage): string => servicePackages.name;
  shortNameFunction = (servicePackages: ServicesPackage): string => servicePackages.description;
  searchFunction = (servicePackages: ServicesPackage): string =>
    servicePackages.name + servicePackages.description;
}
