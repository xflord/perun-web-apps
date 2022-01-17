import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  Attribute,
  AttributesManagerService, FacilitiesManagerService, Facility, Host, Owner, RichDestination,
  Service,
  ServicesManagerService,
  ServicesPackage
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatStepper } from '@angular/material/stepper';
import { EntityStorageService, GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig, isVirtualAttribute } from '@perun-web-apps/perun/utils';
import { NoServiceDialogComponent } from '../../components/no-service-dialog/no-service-dialog.component';
import { ConfigUnsavedDialogComponent } from '../../components/config-unsaved-dialog/config-unsaved-dialog.component';
import { CancelConfigurationDialogComponent } from '../../components/cancel-configuration-dialog/cancel-configuration-dialog.component';
import { Router } from '@angular/router';
import { isArray } from 'rxjs/internal-compatibility';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-facility-configuration-page',
  templateUrl: './facility-configuration-page.component.html',
  styleUrls: ['./facility-configuration-page.component.scss']
})
export class FacilityConfigurationPageComponent implements OnInit, AfterViewInit {

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
    private entityStorageService: EntityStorageService) {
    this.translate.get('FACILITY_CONFIGURATION.ATT_SAVED').subscribe(value => this.saveMsg = value);
    this.translate.get('FACILITY_CONFIGURATION.ATT_REMOVED').subscribe(value => this.removeMsg = value);
  }

  processing = false;

  facility: Facility;
  allowNavigate = false;

  attributes: Attribute[] = [];
  attributeIds: Set<number> = new Set<number>();
  filteredAttributes: Attribute[] = [];
  attributesPerService: Map<number, number[]> = new Map<number, number[]>();
  attSelection: SelectionModel<Attribute> = new SelectionModel<Attribute>(true, []);

  services: Service[] = [];
  serviceIds: Set<number> = new Set<number>();
  servicesPerPackage: Map<number, Set<number>> = new Map<number, Set<number>>();
  servicePackages: ServicesPackage[] = [];
  selectedPackages: ServicesPackage[] = [];
  selection: SelectionModel<Service> = new SelectionModel<Service>(true, []);

  owners: Owner[] = [];
  hosts: Host[] = [];
  destinations: RichDestination[] = [];
  destinationServiceMissing = false;

  availableRoles: string[] = [];

  filterValue = '';
  saveMsg = '';
  removeMsg = '';
  @ViewChild('stepper') stepper: MatStepper;

  BEFORE_OPTIONAL_IDX = 2;
  ATTRIBUTES_IDX = 3;
  DESTINATIONS_IDX = 4;
  AFTER_OPTIONAL_IDX = 5;

  serviceControl: FormControl = new FormControl(false, Validators.requiredTrue);
  attributesControl: FormControl = new FormControl(true, Validators.requiredTrue);

  ngOnInit(): void {
    this.facility = this.entityStorageService.getEntity();
    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Facility');
    this.serviceManager.getServicesPackages().subscribe(packages => {
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

  onCancel() {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      facilityId: this.facility.id,
      lastStep: this.stepper.selectedIndex === this.stepper.steps.length - 1,
      theme: 'facility-theme'
    };
    const dialogRef = this.dialog.open(CancelConfigurationDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.allowNavigate = true;
        sessionStorage.removeItem('newFacilityId');
        this.router.navigate(['facilities'], {queryParamsHandling: 'merge'});
      }
    });
  }

  getServicePackageServices(packages: ServicesPackage[], idx: number) {
    if(idx === packages.length){
      this.serviceManager.getServices().subscribe(services => {
        this.services = services;
      })
    } else {
      this.serviceManager.getServicesFromServicesPackage(packages[idx].id).subscribe(services => {
        this.servicesPerPackage.set(packages[idx].id, new Set<number>([...services.map(service => service.id)]));
        this.getServicePackageServices(packages, idx + 1);
      });
    }
  }

  getServiceRequiredAttributes(services: Service[], idx: number) {
    if(idx === services.length) {
      return;
    } else {
      this.attributesManager.getRequiredAttributesDefinition(services[idx].id).subscribe(reqAtts => {
        reqAtts = reqAtts.filter(reqAtt => this.attributeIds.has(reqAtt.id));
        this.attributesPerService.set(services[idx].id, reqAtts.map(att => att.id));
        this.getServiceRequiredAttributes(services, idx + 1);
      });
    }
  }

  setServiceControl(){
    this.serviceControl.setValue(this.selection.selected.length !== 0);
  }

  buildServiceSet(packages): Set<number> {
    const serviceIds: Set<number> = new Set<number>()
    packages.forEach(pack => {
      this.servicesPerPackage.get(pack.id).forEach(serviceId => serviceIds.add(serviceId));
    })
    return serviceIds;
  }

  setDiff(a: Set<any>,b: Set<any>): Set<any> {
    return new Set([...a].filter(x => !b.has(x)));
  }

  setIntersect(a: Set<any>,b: Set<any>): Set<any> {
    return new Set<number>([...a].filter(x => b.has(x)));
  }

  setSymDif(previous: ServicesPackage[], current: ServicesPackage[]): Set<number>{
    const prev: Set<number> = this.buildServiceSet(previous);
    const curr: Set<number> = this.buildServiceSet(current);

    const prevDifCurr = this.setDiff(prev, curr);
    const currDifPrev = this.setDiff(curr, prev)

    return new Set([...prevDifCurr, ...currDifPrev]);
  }

  filterService(toggled: Set<number>, packages: ServicesPackage[]) {
    const filtered = new Set<number>();
    for(const pack of packages){
      const intersect = this.setIntersect(toggled, this.servicesPerPackage.get(pack.id))
      if(intersect.size !== 0){
        intersect.forEach(value => filtered.add(value));
      }
    }
    return filtered;
  }

  packageSelectionEqual(newPackages: ServicesPackage[]): boolean {
    if(newPackages.length !== this.selectedPackages.length){
      return false;
    }

    newPackages.forEach(newPack => {
      if(this.selectedPackages.findIndex(pack => pack.id === newPack.id) === -1){
        return false;
      }
    });
    return true;
  }

  packagesSelected(selectedPackages) {
    if(this.packageSelectionEqual(selectedPackages)){
      return;
    }
    // Toggle services that are in symmetric difference between previously and currently selected services or deselect all
    this.processing = true;
    let toToggle: Set<number> = new Set<number>();
    if(!selectedPackages || selectedPackages.length === 0) {
      this.selectedPackages.forEach(pack => {
        this.servicesPerPackage.get(pack.id).forEach(serviceId =>  toToggle.add(serviceId));
      });
    } else {
      toToggle = this.setSymDif(this.selectedPackages, selectedPackages);
    }
    if(toToggle.size === 0){
      return;
    }

    const toSelect: Set<number> = this.filterService(toToggle, selectedPackages.filter(pack => this.selectedPackages.findIndex(p => p.id === pack.id) < 0));
    const toDeselect: Set<number> = this.filterService(toToggle, this.selectedPackages.filter(pack => selectedPackages.findIndex(p => p.id === pack.id) < 0));
    for(const service of this.services){
      if(toSelect.has(service.id)){
        this.selection.select(service);
      } else if (toDeselect.has(service.id)){
        this.selection.deselect(service);
      }
    }
    this.selectedPackages = selectedPackages;
    this.setServiceControl();
    this.processing = false;
  }

  checkPackageComplete() {
    const completePacks: ServicesPackage[] = [];
    for(const pack of this.selectedPackages){
      let complete = true;
      for(const serviceId of this.servicesPerPackage.get(pack.id)){
        if(this.selection.selected.findIndex(service => service.id === serviceId) === -1){
          complete = false;
          break;
        }
      }
      if(complete){
        completePacks.push(pack);
      }
    }
    this.selectedPackages = completePacks;
  }

  singleServiceSelected() {
    this.setServiceControl();
    if(this.processing){
      return;
    }
    this.checkPackageComplete();
  }

  back() {
    if (this.stepper.selectedIndex <= this.BEFORE_OPTIONAL_IDX){
      this.setServiceControl();
    }

    if(this.stepper.selectedIndex === this.AFTER_OPTIONAL_IDX && this.selection.selected.length === 0) {
      this.stepper.selectedIndex = this.BEFORE_OPTIONAL_IDX;
    } else {
      this.stepper.previous();
    }
  }

  openSkipDialog() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {theme: 'facility-theme'};
    const dialogRef = this.dialog.open(NoServiceDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.serviceControl.setValue(true);
        this.stepper.selectedIndex = this.AFTER_OPTIONAL_IDX;
      }
    });
  }

  getRequiredAttributes() {
    this.processing = true;
    this.attributesManager.getRequiredAttributesFacilityServices(this.selection.selected.map(service => service.id), this.facility.id)
      .subscribe(attributes => {
        this.attSelection.clear();
        this.attributes = attributes.filter(att => !isVirtualAttribute(att));
        this.filteredAttributes = this.attributes;
        this.attributes.forEach(att => this.attributeIds.add(att.id));
        this.getServiceRequiredAttributes(this.selection.selected, 0);
        this.processing = false;
      });
  }

  onSaveAttributes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.processing = true;
      this.attributesManager.setFacilityAttributes({
        facility: this.facility.id,
        attributes: this.attSelection.selected
      }).subscribe(() => {
        this.notificator.showSuccess(this.saveMsg);
        this.attSelection.clear();
        this.processing = false;
        resolve();
      }, () => {
        this.processing = false;
        reject();
      });
    });
  }

  openUnsavedAttsDialog() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {theme: 'facility-theme'};
    const dialogRef = this.dialog.open(ConfigUnsavedDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.onSaveAttributes().then(() => {
          this.stepper.next();
        },() => this.getRequiredAttributes());
      }
    });
  }

  next() {
    this.checkDestinationDependency(this.stepper.selectedIndex);

    if(this.stepper.selectedIndex === this.BEFORE_OPTIONAL_IDX) {
      // skip optional steps when no service is selected
      if(this.selection.selected.length === 0){
        this.openSkipDialog();
      } else {
        this.getRequiredAttributes();
        this.stepper.next();
      }
    } else if(this.stepper.selectedIndex === this.ATTRIBUTES_IDX) {
      // notify user about unsaved attributes
      if(this.attSelection.selected.length !== 0) {
        this.openUnsavedAttsDialog();
      } else {
        this.stepper.next();
      }
    } else {
      this.stepper.next();
    }
  }

  onFinish() {
    this.allowNavigate = true;
    sessionStorage.removeItem('newFacilityId');
    this.router.navigate(['facilities', this.facility.id], {queryParamsHandling: 'merge'});
  }

  onRemoveAttributes() {
    this.processing = true;
    const ids = this.attSelection.selected.map(att => att.id);
    this.attributesManager.removeFacilityAttributes(this.facility.id, ids).subscribe(() => {
      this.notificator.showSuccess(this.removeMsg);
      this.getRequiredAttributes();
      this.processing = false;
    });
  }

  filterAttributes(services) {
    if(services === undefined || services.length === 0){
      this.filteredAttributes = this.attributes;
      return;
    }

    const attIds: Set<number> = new Set<number>();
    for(const service of services){
      this.attributesPerService.get(service.id).forEach(id => attIds.add(id));
    }
    this.filteredAttributes = [];
    for(const att of this.attributes){
      if(attIds.has(att.id)){
        this.filteredAttributes.push(att);
      }
    }
  }

  getNonEmptyAttributes() {
    this.filteredAttributes = this.attributes.filter(att => {
      if(!!att.value && (!isArray(att.value) ||  att.value.length !== 0)){
        return att;
      }
    });
  }

  checkDestinationDependency(idx: number) {
    if (idx=== this.BEFORE_OPTIONAL_IDX || idx === this.DESTINATIONS_IDX){
      this.serviceIds = new Set<number>([...this.selection.selected.map(service => service.id)]);
      this.destinationServicePresent();
    }
  }

  navigationStep(event) {
    this.checkDestinationDependency(event.previouslySelectedIndex);

    if(event.selectedIndex === this.ATTRIBUTES_IDX) {
      this.getRequiredAttributes();
    } else if(event.selectedIndex === this.DESTINATIONS_IDX){
      this.processing = false;
    } else if(event.selectedIndex <= this.BEFORE_OPTIONAL_IDX){
      this.setServiceControl();
    }
  }

  getOwners() {
    this.processing = true;
    this.facilityService.getFacilityOwners(this.facility.id).subscribe(owners => {
      this.owners = owners;
      this.processing = false;
    })
  }

  getHosts() {
    this.processing = true;
    this.facilityService.getHosts(this.facility.id).subscribe(hosts => {
      this.hosts = hosts;
      this.processing = false;
    })
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  private destinationServicePresent() {
    for (const dest of this.destinations){
      if (!this.serviceIds.has(dest.service.id)){
        this.destinationServiceMissing = true;
        return;
      }
    }
    this.destinationServiceMissing = false;
  }

  canDeactivate() {
    if(!this.allowNavigate) {
      this.onCancel();
    }

    return this.allowNavigate;
  }
}
