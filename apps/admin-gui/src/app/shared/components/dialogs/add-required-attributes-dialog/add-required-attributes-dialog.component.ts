import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AttributeDefinition,
  AttributesManagerService,
  ConsentHub,
  ConsentsManagerService,
  FacilitiesManagerService,
  Facility,
  ServicesManagerService,
} from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { from, Observable } from 'rxjs';
import { concatMap, distinct, map, mergeMap, reduce, startWith } from 'rxjs/operators';

export interface AddRequiredAttributesDialogData {
  serviceId: number;
  theme: string;
}

@Component({
  selector: 'app-add-required-attributes',
  templateUrl: './add-required-attributes-dialog.component.html',
  styleUrls: ['./add-required-attributes-dialog.component.scss'],
})
export class AddRequiredAttributesDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<AddRequiredAttributesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddRequiredAttributesDialogData,
    private serviceManager: ServicesManagerService,
    private attributesManager: AttributesManagerService,
    private facilitiesService: FacilitiesManagerService,
    private consentHubService: ConsentsManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

  consentRequired$: Observable<boolean> = this.facilitiesService
    .getAssignedFacilitiesByService(this.data.serviceId)
    .pipe(
      concatMap(from),
      map((facility: Facility) => facility.id),
      distinct(),
      mergeMap((id: number) => this.consentHubService.getConsentHubByFacility(id)),
      reduce((req, hub: ConsentHub) => req || hub.enforceConsents, false),
      startWith(true)
    );
  serviceEnabled$: Observable<boolean> = this.serviceManager
    .getServiceById(this.data.serviceId)
    .pipe(
      map((service) => service.enabled),
      startWith(true)
    );

  theme: string;
  serviceId: number;

  attrDefinitions: AttributeDefinition[] = [];
  selection = new SelectionModel<AttributeDefinition>(true, []);

  filterValue = '';
  loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.serviceId = this.data.serviceId;
    this.attributesManager.getAllAttributeDefinitions().subscribe((attrDefinitions) => {
      this.attrDefinitions = attrDefinitions;
      this.loading = false;
    });
  }

  onAdd() {
    this.loading = true;
    const attrDefinitionsIds = this.selection.selected.map((attrDef) => attrDef.id);

    this.serviceManager.addRequiredAttributes(this.serviceId, attrDefinitionsIds).subscribe(
      () => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.ADD_REQUIRED_ATTRIBUTES.SUCCESS')
        );
        this.dialogRef.close(true);
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }
}
