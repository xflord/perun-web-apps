import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  FacilitiesManagerService,
  Facility,
  Host,
  Owner,
  RichDestination,
  Service,
  ServicesManagerService,
  ServicesPackage,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatStepper } from '@angular/material/stepper';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig, isVirtualAttribute } from '@perun-web-apps/perun/utils';
import { NoServiceDialogComponent } from '../../components/no-service-dialog/no-service-dialog.component';
import { ConfigUnsavedDialogComponent } from '../../components/config-unsaved-dialog/config-unsaved-dialog.component';
import { CancelConfigurationDialogComponent } from '../../components/cancel-configuration-dialog/cancel-configuration-dialog.component';
import { Router } from '@angular/router';
import { isArray } from 'rxjs/internal-compatibility';
import { FormControl, Validators } from '@angular/forms';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

@Component({
  selector: 'app-facility-configuration-page',
  templateUrl: './facility-configuration-page.component.html',
  styleUrls: ['./facility-configuration-page.component.scss'],
})
export class FacilityConfigurationPageComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') stepper: MatStepper;

  processing = false;

  facility: Facility;
  filteredAttributes: Attribute[] = [];
  attSelection: SelectionModel<Attribute> = new SelectionModel<Attribute>(true, []);
  services: Service[] = [];
  serviceIds: Set<number> = new Set<number>();
  servicePackages: ServicesPackage[] = [];
  selectedPackages: ServicesPackage[] = [];
  selection: SelectionModel<Service> = new SelectionModel<Service>(true, []);
  owners: Owner[] = [];
  hosts: Host[] = [];
  destinations: RichDestination[] = [];
  destinationServiceMissing = false;
  availableRoles: string[] = [];
  filterValue = '';
  ATTRIBUTES_IDX = 3;
  serviceControl: FormControl = new FormControl(false, Validators.requiredTrue);
  attributesControl: FormControl = new FormControl(true, Validators.requiredTrue);
  private allowNavigate = false;
  private attributes: Attribute[] = [];
  private attributeIds: Set<number> = new Set<number>();
  private attributesPerService: Map<number, number[]> = new Map<number, number[]>();
  private servicesPerPackage: Map<number, Set<number>> = new Map<number, Set<number>>();
  private saveMsg = '';
  private removeMsg = '';
  private BEFORE_OPTIONAL_IDX = 2;
  private DESTINATIONS_IDX = 4;
  private AFTER_OPTIONAL_IDX = 5;

  constructor(
    private attributesManager: AttributesManagerService,
    private serviceManager: ServicesManagerService,
    private facilityService: FacilitiesManagerService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private router: Router,
    private guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {
    this.translate
      .get('FACILITY_CONFIGURATION.ATT_SAVED')
      .subscribe((value: string) => (this.saveMsg = value));
    this.translate
      .get('FACILITY_CONFIGURATION.ATT_REMOVED')
      .subscribe((value: string) => (this.removeMsg = value));
  }

  ngOnInit(): void {
    this.facility = this.entityStorageService.getEntity();
    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Facility');
    this.serviceManager.getServicesPackages().subscribe((packages) => {
      this.servicePackages = packages;
      this.getServicePackageServices(packages, 0);
    });
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
    this.attSelection.changed.subscribe(() => {
      this.attributesControl.setValue(this.attSelection.selected.length === 0);
    });
  }

  onCancel(): void {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      facilityId: this.facility.id,
      lastStep: this.stepper.selectedIndex === this.stepper.steps.length - 1,
      theme: 'facility-theme',
    };
    const dialogRef = this.dialog.open(CancelConfigurationDialogComponent, config);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.allowNavigate = true;
        sessionStorage.removeItem('newFacilityId');
        void this.router.navigate(['facilities'], { queryParamsHandling: 'merge' });
      }
    });
  }

  packagesSelected(selectedPackages: ServicesPackage[]): void {
    if (this.packageSelectionEqual(selectedPackages)) {
      return;
    }
    // Toggle services that are in symmetric difference between previously and currently selected services or deselect all
    this.processing = true;
    let toToggle: Set<number> = new Set<number>();
    if (!selectedPackages || selectedPackages.length === 0) {
      this.selectedPackages.forEach((pack) => {
        this.servicesPerPackage.get(pack.id).forEach((serviceId) => toToggle.add(serviceId));
      });
    } else {
      toToggle = this.setSymDif(this.selectedPackages, selectedPackages);
    }
    if (toToggle.size === 0) {
      return;
    }

    const toSelect: Set<number> = this.filterService(
      toToggle,
      selectedPackages.filter(
        (pack) => this.selectedPackages.findIndex((p) => p.id === pack.id) < 0
      )
    );
    const toDeselect: Set<number> = this.filterService(
      toToggle,
      this.selectedPackages.filter(
        (pack) => selectedPackages.findIndex((p) => p.id === pack.id) < 0
      )
    );
    for (const service of this.services) {
      if (toSelect.has(service.id)) {
        this.selection.select(service);
      } else if (toDeselect.has(service.id)) {
        this.selection.deselect(service);
      }
    }
    this.selectedPackages = selectedPackages;
    this.setServiceControl();
    this.processing = false;
  }

  singleServiceSelected(): void {
    this.setServiceControl();
    if (this.processing) {
      return;
    }
    this.checkPackageComplete();
  }

  back(): void {
    if (this.stepper.selectedIndex <= this.BEFORE_OPTIONAL_IDX) {
      this.setServiceControl();
    }

    if (
      this.stepper.selectedIndex === this.AFTER_OPTIONAL_IDX &&
      this.selection.selected.length === 0
    ) {
      this.stepper.selectedIndex = this.BEFORE_OPTIONAL_IDX;
    } else {
      this.stepper.previous();
    }
  }

  onSaveAttributes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.processing = true;
      this.attributesManager
        .setFacilityAttributes({
          facility: this.facility.id,
          attributes: this.attSelection.selected,
        })
        .subscribe(
          () => {
            this.notificator.showSuccess(this.saveMsg);
            this.attSelection.clear();
            this.processing = false;
            resolve();
          },
          () => {
            this.processing = false;
            reject();
          }
        );
    });
  }

  next(): void {
    this.checkDestinationDependency(this.stepper.selectedIndex);

    if (this.stepper.selectedIndex === this.BEFORE_OPTIONAL_IDX) {
      // skip optional steps when no service is selected
      if (this.selection.selected.length === 0) {
        this.openSkipDialog();
      } else {
        this.getRequiredAttributes();
        this.stepper.next();
      }
    } else if (this.stepper.selectedIndex === this.ATTRIBUTES_IDX) {
      // notify user about unsaved attributes
      if (this.attSelection.selected.length !== 0) {
        this.openUnsavedAttsDialog();
      } else {
        this.stepper.next();
      }
    } else {
      this.stepper.next();
    }
  }

  onFinish(): void {
    this.allowNavigate = true;
    sessionStorage.removeItem('newFacilityId');
    void this.router.navigate(['facilities', this.facility.id], { queryParamsHandling: 'merge' });
  }

  onRemoveAttributes(): void {
    this.processing = true;
    const ids = this.attSelection.selected.map((att) => att.id);
    this.attributesManager.removeFacilityAttributes(this.facility.id, ids).subscribe(() => {
      this.notificator.showSuccess(this.removeMsg);
      this.getRequiredAttributes();
      this.processing = false;
    });
  }

  filterAttributes(services: Service[]): void {
    if (services === undefined || services.length === 0) {
      this.filteredAttributes = this.attributes;
      return;
    }

    const attIds: Set<number> = new Set<number>();
    for (const service of services) {
      this.attributesPerService.get(service.id).forEach((id) => attIds.add(id));
    }
    this.filteredAttributes = [];
    for (const att of this.attributes) {
      if (attIds.has(att.id)) {
        this.filteredAttributes.push(att);
      }
    }
  }

  getNonEmptyAttributes(): void {
    this.filteredAttributes = this.attributes.filter((att) => {
      if (!!att.value && (!isArray(att.value) || att.value.length !== 0)) {
        return att;
      }
    });
  }

  navigationStep(event: StepperSelectionEvent): void {
    this.checkDestinationDependency(event.previouslySelectedIndex);

    if (event.selectedIndex === this.ATTRIBUTES_IDX) {
      this.getRequiredAttributes();
    } else if (event.selectedIndex === this.DESTINATIONS_IDX) {
      this.processing = false;
    } else if (event.selectedIndex <= this.BEFORE_OPTIONAL_IDX) {
      this.setServiceControl();
    }
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  canDeactivate(): boolean {
    if (!this.allowNavigate) {
      this.onCancel();
    }

    return this.allowNavigate;
  }

  private getServicePackageServices(packages: ServicesPackage[], idx: number): void {
    if (idx === packages.length) {
      this.serviceManager.getServices().subscribe((services) => {
        this.services = services;
      });
    } else {
      this.serviceManager.getServicesFromServicesPackage(packages[idx].id).subscribe((services) => {
        this.servicesPerPackage.set(
          packages[idx].id,
          new Set<number>([...services.map((service) => service.id)])
        );
        this.getServicePackageServices(packages, idx + 1);
      });
    }
  }

  private getServiceRequiredAttributes(services: Service[], idx: number): void {
    if (idx === services.length) {
      return;
    } else {
      this.attributesManager
        .getRequiredAttributesDefinition(services[idx].id)
        .subscribe((reqAtts) => {
          reqAtts = reqAtts.filter((reqAtt) => this.attributeIds.has(reqAtt.id));
          this.attributesPerService.set(
            services[idx].id,
            reqAtts.map((att) => att.id)
          );
          this.getServiceRequiredAttributes(services, idx + 1);
        });
    }
  }

  private setServiceControl(): void {
    this.serviceControl.setValue(this.selection.selected.length !== 0);
  }

  private buildServiceSet(packages: ServicesPackage[]): Set<number> {
    const serviceIds: Set<number> = new Set<number>();
    packages.forEach((pack) => {
      this.servicesPerPackage.get(pack.id).forEach((serviceId) => serviceIds.add(serviceId));
    });
    return serviceIds;
  }

  private setDiff(a: Set<number>, b: Set<number>): Set<number> {
    return new Set([...a].filter((x) => !b.has(x)));
  }

  private setIntersect(a: Set<number>, b: Set<number>): Set<number> {
    return new Set<number>([...a].filter((x) => b.has(x)));
  }

  private setSymDif(previous: ServicesPackage[], current: ServicesPackage[]): Set<number> {
    const prev: Set<number> = this.buildServiceSet(previous);
    const curr: Set<number> = this.buildServiceSet(current);

    const prevDifCurr = this.setDiff(prev, curr);
    const currDifPrev = this.setDiff(curr, prev);

    return new Set([...prevDifCurr, ...currDifPrev]);
  }

  private filterService(toggled: Set<number>, packages: ServicesPackage[]): Set<number> {
    const filtered = new Set<number>();
    for (const pack of packages) {
      const intersect = this.setIntersect(toggled, this.servicesPerPackage.get(pack.id));
      if (intersect.size !== 0) {
        intersect.forEach((value) => filtered.add(value));
      }
    }
    return filtered;
  }

  private packageSelectionEqual(newPackages: ServicesPackage[]): boolean {
    if (newPackages.length !== this.selectedPackages.length) {
      return false;
    }

    newPackages.forEach((newPack) => {
      if (this.selectedPackages.findIndex((pack) => pack.id === newPack.id) === -1) {
        return false;
      }
    });
    return true;
  }

  private checkPackageComplete(): void {
    const completePacks: ServicesPackage[] = [];
    for (const pack of this.selectedPackages) {
      let complete = true;
      for (const serviceId of this.servicesPerPackage.get(pack.id)) {
        if (this.selection.selected.findIndex((service) => service.id === serviceId) === -1) {
          complete = false;
          break;
        }
      }
      if (complete) {
        completePacks.push(pack);
      }
    }
    this.selectedPackages = completePacks;
  }

  private openSkipDialog(): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = { theme: 'facility-theme' };
    const dialogRef = this.dialog.open(NoServiceDialogComponent, config);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.serviceControl.setValue(true);
        this.stepper.selectedIndex = this.AFTER_OPTIONAL_IDX;
      }
    });
  }

  private getRequiredAttributes(): void {
    this.processing = true;
    this.attributesManager
      .getRequiredAttributesFacilityServices(
        this.selection.selected.map((service) => service.id),
        this.facility.id
      )
      .subscribe((attributes) => {
        this.attSelection.clear();
        this.attributes = attributes.filter((att) => !isVirtualAttribute(att));
        this.filteredAttributes = this.attributes;
        this.attributes.forEach((att) => this.attributeIds.add(att.id));
        this.getServiceRequiredAttributes(this.selection.selected, 0);
        this.processing = false;
      });
  }

  private openUnsavedAttsDialog(): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = { theme: 'facility-theme' };
    const dialogRef = this.dialog.open(ConfigUnsavedDialogComponent, config);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSaveAttributes().then(
          () => {
            this.stepper.next();
          },
          () => this.getRequiredAttributes()
        );
      }
    });
  }

  private checkDestinationDependency(idx: number): void {
    if (idx === this.BEFORE_OPTIONAL_IDX || idx === this.DESTINATIONS_IDX) {
      this.serviceIds = new Set<number>([...this.selection.selected.map((service) => service.id)]);
      this.destinationServicePresent();
    }
  }

  private destinationServicePresent(): void {
    for (const dest of this.destinations) {
      if (!this.serviceIds.has(dest.service.id)) {
        this.destinationServiceMissing = true;
        return;
      }
    }
    this.destinationServiceMissing = false;
  }
}
