import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  Facility,
  Group,
  Resource,
  RichMember,
  Service,
} from '@perun-web-apps/perun/openapi';
import { TABLE_ATTRIBUTES_SETTINGS } from '@perun-web-apps/config/table-config';
import { AttributesListComponent } from '@perun-web-apps/perun/components';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { EditAttributeDialogComponent } from '@perun-web-apps/perun/dialogs';
// eslint-disable-next-line
import { CreateAttributeDialogComponent } from '../../../../../../apps/admin-gui/src/app/shared/components/dialogs/create-attribute-dialog/create-attribute-dialog.component';

export type ServiceSelectValue = 'ALL' | 'NOT_SELECTED';

@Component({
  selector: 'perun-web-apps-service-configurator',
  templateUrl: './service-configurator.component.html',
  styleUrls: ['./service-configurator.component.scss'],
})
export class ServiceConfiguratorComponent implements OnInit, OnChanges {
  @Input() facility: Facility;
  @Input() service: Service | ServiceSelectValue;
  @Input() resource: Resource;
  @Input() group: Group;
  @Input() member: RichMember;

  @ViewChild('FacilityAList') facilityAlist: AttributesListComponent;
  @ViewChild('ResourceAList') resourceAList: AttributesListComponent;
  @ViewChild('GroupAList') groupAList: AttributesListComponent;
  @ViewChild('MemberAList') memberAList: AttributesListComponent;

  selectionFacility = new SelectionModel<Attribute>(true, []);
  selectionResource = new SelectionModel<Attribute>(true, []);
  selectionGroup = new SelectionModel<Attribute>(true, []);
  selectionMember = new SelectionModel<Attribute>(true, []);

  showTab = 0;

  facilityAttributes: Attribute[];
  resourceAttributes: Attribute[];
  groupAttributes: Attribute[];
  memberAttributes: Attribute[];

  tableId = TABLE_ATTRIBUTES_SETTINGS;

  constructor(private attributesManager: AttributesManagerService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadFacilityAttributes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['service']) {
      this.reloadAll();
      return;
    }
    if (changes['resource']) {
      if (changes['resource'].currentValue === undefined) {
        this.resourceAttributes = undefined;
        this.showTab = 0;
      } else {
        this.showTab = 1;
        this.loadResourceAttributes();
      }
    } else if (changes['group']) {
      if (changes['group'].currentValue === undefined) {
        this.groupAttributes = undefined;
        this.showTab = 1;
      } else {
        this.showTab = 2;
        this.attributesManager
          .getGroupAttributes(this.group.id)
          .subscribe((attrs) => (this.groupAttributes = attrs));
      }
    } else if (changes['member']) {
      if (changes['member'].currentValue === undefined) {
        this.memberAttributes = undefined;
        this.showTab = 2;
      } else {
        this.showTab = 3;
        this.attributesManager
          .getMemberAttributes(this.member.id)
          .subscribe((attrs) => (this.memberAttributes = attrs));
      }
    }
  }

  onAddAttFacility(): void {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.facility.id,
      entity: 'facility',
      notEmptyAttributes: this.facilityAttributes,
      style: 'facility-theme',
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'saved') {
        this.reloadAll();
      }
    });
  }

  onSaveFacility(): void {
    this.facilityAlist.updateMapAttributes();

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, {
      width: '450px',
      data: {
        entityId: this.facility.id,
        entity: 'facility',
        attributes: this.selectionFacility.selected,
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.selectionFacility.clear();
        this.ngOnInit();
      }
    });
  }

  onAddAttResource(): void {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.resource.id,
      entity: 'resource',
      notEmptyAttributes: this.resourceAttributes,
      style: 'facility-theme',
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'saved') {
        this.reloadAll();
      }
    });
  }

  onSaveResource(): void {
    this.resourceAList.updateMapAttributes();

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, {
      width: '450px',
      data: {
        entityId: this.resource.id,
        entity: 'resource',
        attributes: this.selectionResource.selected,
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.selectionResource.clear();
        this.ngOnInit();
      }
    });
  }

  onAddAttGroup(): void {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.group.id,
      entity: 'group',
      notEmptyAttributes: this.groupAttributes,
      style: 'facility-theme',
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'saved') {
        this.reloadAll();
      }
    });
  }

  onSaveGroup(): void {
    this.groupAList.updateMapAttributes();

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, {
      width: '450px',
      data: {
        entityId: this.group.id,
        entity: 'group',
        attributes: this.selectionGroup.selected,
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.selectionGroup.clear();
        this.ngOnInit();
      }
    });
  }

  onAddAttMember(): void {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.member.id,
      entity: 'member',
      notEmptyAttributes: this.memberAttributes,
      style: 'facility-theme',
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'saved') {
        this.reloadAll();
      }
    });
  }

  onSaveMember(): void {
    this.memberAList.updateMapAttributes();

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, {
      width: '450px',
      data: {
        entityId: this.member.id,
        entity: 'member',
        attributes: this.selectionMember.selected,
      },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.selectionMember.clear();
        this.ngOnInit();
      }
    });
  }

  private loadResourceAttributes(): void {
    if (this.service === 'NOT_SELECTED') {
      this.attributesManager
        .getResourceAttributes(this.resource.id)
        .subscribe((attrs) => (this.resourceAttributes = attrs));
    } else if (this.service === 'ALL') {
      this.attributesManager
        .getRequiredAttributesResource(this.resource.id)
        .subscribe((attrs) => (this.resourceAttributes = attrs));
    } else {
      this.attributesManager
        .getRequiredAttributesResourceService(this.service.id, this.resource.id)
        .subscribe((attrs) => (this.resourceAttributes = attrs));
    }
  }

  private loadFacilityAttributes(): void {
    if (this.service === 'NOT_SELECTED') {
      this.attributesManager
        .getFacilityAttributes(this.facility.id)
        .subscribe((attrs) => (this.facilityAttributes = attrs));
    } else if (this.service === 'ALL') {
      this.attributesManager
        .getRequiredAttributesFacility(this.facility.id)
        .subscribe((attrs) => (this.facilityAttributes = attrs));
    } else {
      this.attributesManager
        .getRequiredAttributesFacilityService(this.service.id, this.facility.id)
        .subscribe((attrs) => (this.facilityAttributes = attrs));
    }
  }

  private reloadAll(): void {
    this.loadFacilityAttributes();
    if (this.resource !== undefined) {
      this.loadResourceAttributes();
    }
  }
}
