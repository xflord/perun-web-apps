import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { openClose } from '@perun-web-apps/perun/animations';
import {
  DestinationPropagationType,
  DestinationType,
  FacilitiesManagerService,
  Facility,
  Service,
  ServicesManagerService,
} from '@perun-web-apps/perun/openapi';
import { AbstractControl, UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { emailRegexString } from '@perun-web-apps/perun/utils';

export interface AddServicesDestinationDialogData {
  facility: Facility;
  theme: string;
  configServices: Service[];
}

@Component({
  selector: 'app-perun-web-apps-add-services-destination-dialog',
  templateUrl: './add-services-destination-dialog.component.html',
  styleUrls: ['./add-services-destination-dialog.component.scss'],
  animations: [openClose],
})
export class AddServicesDestinationDialogComponent implements OnInit {
  servicesOnFacility: boolean;
  services: Service[] = [];
  serviceControl: UntypedFormControl;
  types: string[] = [
    'host',
    'user@host',
    'user@host:port',
    'user@host-windows',
    'host-windows-proxy',
    'url',
    'email',
    'semail',
    'service-specific',
  ];
  selectedType = 'host';
  propagations: string[] = ['PARALLEL', 'DUMMY'];
  selectedPropagation = 'PARALLEL';
  destinationControl: UntypedFormControl;
  useFacilityHost = false;
  loading = false;
  private emailControl: UntypedFormControl;

  private emailRegex = new RegExp(emailRegexString);
  private hostPattern = new RegExp(
    '^(?!:\\/\\/)(?=.{1,255}$)((.{1,63}\\.){1,127}(?![0-9]*$)[a-z0-9-]+\\.?)$|^(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}$'
  );
  private urlPattern = new RegExp(
    "^(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;()*$']*[-a-zA-Z0-9+&@#/%=~_|()*$']$"
  );
  private userAtHostPattern = new RegExp(
    '^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\\$)@(?:(?!:\\/\\/)(?=.{1,255}$)((.{1,63}\\.){1,127}(?![0-9]*$)[a-z0-9-]+\\.?)$|(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}$)'
  );
  private userAtHostPortPattern = new RegExp(
    '^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\\$)@(?:(?!:\\/\\/)(?=.{1,255}$)((.{1,63}\\.){1,127}(?![0-9]*$)[a-z0-9-]+\\.?)|(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}):[0-9]+'
  );
  private serviceSpecificPattern = new RegExp('^(?!-)[a-zA-Z0-9-_.:/]*$');

  constructor(
    public dialogRef: MatDialogRef<AddServicesDestinationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddServicesDestinationDialogData,
    public facilitiesManager: FacilitiesManagerService,
    public servicesManager: ServicesManagerService
  ) {}

  ngOnInit(): void {
    this.serviceControl = new UntypedFormControl(undefined, Validators.required);
    this.destinationControl = new UntypedFormControl('', this.getDestinationValidator());
    this.emailControl = new UntypedFormControl('', [
      Validators.required,
      Validators.pattern(this.emailRegex),
    ]);
    this.servicesOnFacility = true;
    this.getServices();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.loading = true;

    if (this.serviceControl.value === 'all') {
      if (this.useFacilityHost) {
        this.servicesManager
          .addDestinationsDefinedByHostsOnFacilityWithListOfServiceAndFacility({
            services: this.services,
            facility: this.data.facility.id,
          })
          .subscribe(
            () => {
              this.dialogRef.close(true);
            },
            () => (this.loading = false)
          );
      } else {
        this.servicesManager
          .addDestinationToMultipleServices({
            services: this.services,
            facility: this.data.facility.id,
            destination: this.destinationControl.value as string,
            type: this.selectedType as DestinationType,
            propagationType: this.selectedPropagation as DestinationPropagationType,
          })
          .subscribe(
            () => {
              this.dialogRef.close(true);
            },
            () => (this.loading = false)
          );
      }
    } else {
      if (this.useFacilityHost) {
        this.servicesManager
          .addDestinationsDefinedByHostsOnFacilityWithServiceAndFacility(
            (this.serviceControl.value as Service).id,
            this.data.facility.id
          )
          .subscribe(
            () => {
              this.dialogRef.close(true);
            },
            () => (this.loading = false)
          );
      } else {
        this.servicesManager
          .addDestination(
            (this.serviceControl.value as Service).id,
            this.data.facility.id,
            this.destinationControl.value as string,
            this.selectedType as DestinationType,
            this.selectedPropagation as DestinationPropagationType
          )
          .subscribe(
            () => {
              this.dialogRef.close(true);
            },
            () => (this.loading = false)
          );
      }
    }
  }

  getServices(): void {
    this.loading = true;
    if (this.servicesOnFacility) {
      if (this.data.configServices.length !== 0) {
        this.services = this.data.configServices;
      } else {
        this.servicesManager.getAssignedServices(this.data.facility.id).subscribe(
          (services) => {
            this.services = services;
          },
          () => (this.loading = false)
        );
      }
    } else {
      this.servicesManager.getServices().subscribe(
        (services) => {
          this.services = services;
        },
        () => (this.loading = false)
      );
    }
    this.loading = false;
    this.serviceControl.setValue(undefined);
  }

  getTypeForView(type: string): string {
    if (type === 'semail') {
      return 'Send Mail';
    }
    if (type === 'service-specific') {
      return 'Service Specific';
    }
    return type;
  }

  invalidDestination(): boolean {
    if (this.selectedType === 'host' && this.useFacilityHost) {
      return false;
    }

    return this.destinationControl.invalid;
  }

  private getDestinationValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: { [key: string]: string } } | null => {
      if (!control.value) {
        return null;
      }
      let pattern: RegExp;
      switch (this.selectedType) {
        case 'host':
        case 'host-windows-proxy':
          pattern = this.hostPattern;
          break;
        case 'email':
        case 'semail':
          pattern = this.emailRegex;
          break;
        case 'url':
          pattern = this.urlPattern;
          break;
        case 'user@host':
        case 'user@host-windows':
          pattern = this.userAtHostPattern;
          break;
        case 'user@host:port':
          pattern = this.userAtHostPortPattern;
          break;
        case 'service-specific':
          pattern = this.serviceSpecificPattern;
          break;
        default:
          return null;
      }

      return pattern.test(control.value as string)
        ? null
        : { invalidDestination: { value: control.value as string } };
    };
  }
}
