import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  FacilitiesManagerService,
  Facility,
  Group,
  GroupsManagerService,
  MembersManagerService,
  Resource,
  ResourcesManagerService,
  RichMember,
  User,
} from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { AttributesListComponent } from '@perun-web-apps/perun/components';
import { SelectionModel } from '@angular/cdk/collections';
import { DeleteAttributeDialogComponent } from '../dialogs/delete-attribute-dialog/delete-attribute-dialog.component';
import { getDefaultDialogConfig, getRecentlyVisitedIds } from '@perun-web-apps/perun/utils';
import { EditAttributeDialogComponent } from '@perun-web-apps/perun/dialogs';
import { CreateAttributeDialogComponent } from '../dialogs/create-attribute-dialog/create-attribute-dialog.component';
import { Urns } from '@perun-web-apps/perun/urns';
import { GroupWithStatus, ResourceWithStatus } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-two-entity-attribute-page',
  templateUrl: './two-entity-attribute-page.component.html',
  styleUrls: ['./two-entity-attribute-page.component.scss'],
})
export class TwoEntityAttributePageComponent implements OnInit {
  @ViewChild('list')
  list: AttributesListComponent;
  @Input()
  firstEntityId: number;
  @Input()
  firstEntity: string;
  @Input()
  secondEntity: string;
  entityValues: Resource[] | Facility[] | Group[] | RichMember[] | User[] = [];
  attributes: Attribute[] = [];
  selection = new SelectionModel<Attribute>(true, []);
  specificSecondEntity: Resource | Facility | Group | RichMember | User;
  allowedStatuses: string[] = ['INVALID', 'VALID'];
  loading = false;
  innerLoading = false;
  filterValue = '';
  noEntityMessage: string;

  constructor(
    private attributesManagerService: AttributesManagerService,
    private resourcesManagerService: ResourcesManagerService,
    private facilitiesManagerService: FacilitiesManagerService,
    private groupsManagerService: GroupsManagerService,
    private membersManager: MembersManagerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEntityValues();
    this.setMessages(this.secondEntity.toLowerCase());
  }

  loadEntityValues(): void {
    this.loading = true;
    switch (this.firstEntity) {
      case 'member':
        switch (this.secondEntity) {
          case 'resource':
            this.resourcesManagerService
              .getAssignedResourcesWithStatus(this.firstEntityId)
              .subscribe((resources) => {
                this.entityValues = resources.map((resource) => resource.enrichedResource.resource);
                this.preselectEntity();
                this.loading = false;
              });
            break;
          case 'group':
            this.groupsManagerService.getMemberGroups(this.firstEntityId).subscribe((groups) => {
              this.entityValues = groups;
              this.preselectEntity();
              this.loading = false;
            });
        }
        break;
      case 'group':
        switch (this.secondEntity) {
          case 'resource':
            this.resourcesManagerService
              .getResourceAssignments(this.firstEntityId)
              .subscribe((resources) => {
                this.entityValues = resources.map((r) => {
                  const resWithStatus: ResourceWithStatus = r.enrichedResource.resource;
                  resWithStatus.status = r.status;
                  return resWithStatus;
                });
                this.preselectEntity();
                this.loading = false;
              });
            break;
          case 'member':
            // return one attribute because if an empty list is passed, all attributes are returned
            this.membersManager
              .getCompleteRichMembersForGroup(
                this.firstEntityId,
                false,
                this.allowedStatuses,
                null,
                [Urns.MEMBER_CORE_ID]
              )
              .subscribe((members) => {
                this.entityValues = members;
                this.preselectEntity();
                this.loading = false;
              });
            break;
        }
        break;
      case 'user':
        this.facilitiesManagerService
          .getAssignedFacilitiesByUser(this.firstEntityId)
          .subscribe((facilities) => {
            this.entityValues = facilities;
            this.preselectEntity();
            this.loading = false;
          });
        break;
      case 'resource':
        switch (this.secondEntity) {
          case 'member':
            this.resourcesManagerService
              .getAssignedMembersWithStatus(this.firstEntityId)
              .subscribe((members) => {
                this.entityValues = members.map((member) => member.richMember);
                this.preselectEntity();
                this.loading = false;
              });
            break;
          case 'group':
            this.resourcesManagerService
              .getGroupAssignments(this.firstEntityId)
              .subscribe((groups) => {
                this.entityValues = groups.map((g) => {
                  const resWithStatus: GroupWithStatus = g.enrichedGroup.group;
                  resWithStatus.status = g.status;
                  return resWithStatus;
                });
                this.preselectEntity();
                this.loading = false;
              });
            break;
        }
        break;
      case 'facility':
        this.facilitiesManagerService.getAssignedUsers(this.firstEntityId).subscribe((users) => {
          this.entityValues = users;
          this.preselectEntity();
          this.loading = false;
        });
        break;
    }
  }

  preselectEntity(): void {
    if (this.entityValues.length !== 0) {
      this.findInitiallySelectedEntity();
    }
  }

  findInitiallySelectedEntity(): void {
    let initialEntity = this.entityValues[0];
    const recentIds = getRecentlyVisitedIds(this.entityKey());
    if (recentIds) {
      for (const entity of this.entityValues) {
        if (entity.id === recentIds[0]) {
          initialEntity = entity;
          break;
        }
      }
    }
    this.specifySecondEntity(initialEntity);
  }

  entityKey(): string {
    // Can be extended to support different entities in the future
    switch (this.secondEntity) {
      case 'group':
        return 'groups';
      default:
        return '';
    }
  }

  getAttributes(entityId: number): void {
    this.innerLoading = true;
    this.selection.clear();
    switch (this.firstEntity) {
      case 'member':
        switch (this.secondEntity) {
          case 'resource':
            this.attributesManagerService
              .getMemberResourceAttributes(this.firstEntityId, entityId)
              .subscribe((attributes) => {
                this.attributes = attributes;
                this.innerLoading = false;
              });
            break;
          case 'group':
            this.attributesManagerService
              .getMemberGroupAttributes(this.firstEntityId, entityId)
              .subscribe((attributes) => {
                this.attributes = attributes;
                this.innerLoading = false;
              });
        }
        break;
      case 'group':
        switch (this.secondEntity) {
          case 'resource':
            this.attributesManagerService
              .getGroupResourceAttributes(this.firstEntityId, entityId)
              .subscribe((attributes) => {
                this.attributes = attributes;
                this.innerLoading = false;
              });
            break;
          case 'member':
            this.attributesManagerService
              .getMemberGroupAttributes(entityId, this.firstEntityId)
              .subscribe((attributes) => {
                this.attributes = attributes;
                this.innerLoading = false;
              });
            break;
        }
        break;
      case 'user':
        this.attributesManagerService
          .getUserFacilityAttributes(this.firstEntityId, entityId)
          .subscribe((attributes) => {
            this.attributes = attributes;
            this.innerLoading = false;
          });
        break;
      case 'resource':
        switch (this.secondEntity) {
          case 'member':
            this.attributesManagerService
              .getMemberResourceAttributes(entityId, this.firstEntityId)
              .subscribe((attributes) => {
                this.attributes = attributes;
                this.innerLoading = false;
              });
            break;
          case 'group':
            this.attributesManagerService
              .getGroupResourceAttributes(entityId, this.firstEntityId)
              .subscribe((attributes) => {
                this.attributes = attributes;
                this.innerLoading = false;
              });
            break;
        }
        break;
      case 'facility':
        this.attributesManagerService
          .getUserFacilityAttributes(entityId, this.firstEntityId)
          .subscribe((attributes) => {
            this.attributes = attributes;
            this.innerLoading = false;
          });
        break;
    }
  }

  setMessages(entity: string): void {
    this.noEntityMessage = `No ${entity} assigned`;
  }

  onSave(entityId: number): void {
    // have to use this to update attribute with map in it, before saving it
    this.list.updateMapAttributes();

    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.firstEntityId,
      entity: this.firstEntity,
      secondEntity: this.secondEntity,
      secondEntityId: entityId,
      attributes: this.selection.selected,
    };

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selection.clear();
        this.getAttributes(entityId);
      }
    });
  }

  onDelete(entityId: number): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.firstEntityId,
      entity: this.firstEntity,
      secondEntity: this.secondEntity,
      secondEntityId: entityId,
      attributes: this.selection.selected,
      theme: `${this.firstEntity}-theme`,
    };

    const dialogRef = this.dialog.open(DeleteAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((didConfirm) => {
      if (didConfirm) {
        this.selection.clear();
        this.getAttributes(entityId);
      }
    });
  }

  onAdd(entityId: number): void {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.firstEntityId,
      entity: this.firstEntity,
      secondEntity: this.secondEntity,
      secondEntityId: entityId,
      notEmptyAttributes: this.attributes,
      style: `${this.firstEntity}-theme`,
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selection.clear();
        this.getAttributes(entityId);
      }
    });
  }

  specifySecondEntity(entity: Group | Facility | Resource | RichMember | User): void {
    if (entity) {
      this.specificSecondEntity = entity;
      this.getAttributes(this.specificSecondEntity.id);
    }
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
