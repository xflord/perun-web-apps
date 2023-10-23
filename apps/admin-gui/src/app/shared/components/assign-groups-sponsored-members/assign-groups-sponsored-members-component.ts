import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  AttributesManagerService,
  Group,
  GroupsManagerService,
  RichGroup,
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { TABLE_VO_GROUPS } from '@perun-web-apps/config/table-config';
import { Observable, Subscription } from 'rxjs';
import { Urns } from '@perun-web-apps/perun/urns';
import { hasBooleanAttributeEnabled, isGroupSynchronized } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-assign-groups-sponsored-members-component',
  templateUrl: 'assign-groups-sponsored-members-component.html',
  styleUrls: ['assign-groups-sponsored-members-component.scss'],
})
export class AssignGroupsSponsoredMembersComponent implements OnInit, OnDestroy {
  @Input() submit: Observable<void>;

  @Input() voId: number;
  @Output() groupsToAdd = new EventEmitter<number[]>();
  @Output() submitAllowed = new EventEmitter<boolean>();

  loading = false;
  createGroupAuth: boolean;
  assignableGroups: Group[] = [];
  allVoGroups: Group[] = [];
  manualMemberAddingBlocked = false;
  groupAssignment = 'none';

  selection = new SelectionModel<Group>(true, []);
  name = '';
  description = '';
  asSubgroup = false;
  parentGroup: Group = null;
  filterValue = '';
  tableId = TABLE_VO_GROUPS;
  groupToCreate: Group = {
    id: 0,
    beanName: 'Group',
  };
  groupIds: number[] = [];
  onSubmit: Subscription;

  private groupAttrNames = [Urns.GROUP_SYNC_ENABLED, Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING];

  constructor(
    private groupsService: GroupsManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private attributesService: AttributesManagerService,
  ) {}

  ngOnInit(): void {
    this.onSubmit = this.submit.subscribe(() => this.handleGroups());
    this.selection.changed.subscribe(() => this.isSubmitAllowed());
    this.createGroupAuth = this.guiAuthResolver.isAuthorized('createGroup_Vo_Group_policy', [
      { id: this.voId, beanName: 'Vo' },
    ]);
    this.attributesService.getVoAttributes(this.voId).subscribe((attributes) => {
      this.manualMemberAddingBlocked = hasBooleanAttributeEnabled(
        attributes,
        Urns.VO_BLOCK_MANUAL_MEMBER_ADDING,
      );
      this.groupsService
        .getAllRichGroupsWithAttributesByNames(this.voId, this.groupAttrNames)
        .subscribe((groups) => {
          this.allVoGroups = groups.filter((grp) => grp.name !== 'members');
          this.assignableGroups = this.filterAssignableGroups(groups);
          this.isSubmitAllowed();
        });
    });
  }

  ngOnDestroy(): void {
    if (this.onSubmit !== undefined) {
      this.onSubmit.unsubscribe();
    }
  }

  groupAssigmentChanged(): void {
    this.selection.clear();

    this.groupToCreate.name = '';
    this.groupToCreate.description = '';
    this.asSubgroup = false;
    this.groupToCreate.parentGroupId = null;
    this.isSubmitAllowed();
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  onNameChange(name: string): void {
    this.groupToCreate.name = name;
    this.isSubmitAllowed();
  }

  onParentChange(parentGroup: Group): void {
    if (parentGroup === null) {
      this.groupToCreate.parentGroupId = null;
    } else {
      this.groupToCreate.parentGroupId = parentGroup.id;
    }
    this.isSubmitAllowed();
  }

  onAsSubgroupChange(asSubgroup: boolean): void {
    this.asSubgroup = asSubgroup;
    this.isSubmitAllowed();
  }

  onDescriptionChange(description: string): void {
    this.groupToCreate.description = description;
    this.isSubmitAllowed();
  }

  isSubmitAllowed(): void {
    this.submitAllowed.emit(
      !(
        this.groupAssignment === null ||
        (this.groupAssignment === 'existing' && this.selection.selected.length === 0) ||
        (this.groupAssignment === 'new' &&
          (this.groupToCreate.name.length === 0 || this.groupToCreate.description.length === 0)) ||
        (this.asSubgroup && this.groupToCreate.parentGroupId === null)
      ),
    );
  }

  handleGroups(): void {
    this.loading = true;
    if (this.groupAssignment === 'new') {
      if (this.asSubgroup) {
        this.groupsService
          .createGroupWithParentGroupNameDescription(
            this.groupToCreate.parentGroupId,
            this.groupToCreate.name,
            this.groupToCreate.description,
          )
          .subscribe({
            next: (group) => {
              this.groupIds.push(group.id);
              this.groupsToAdd.emit(this.groupIds);
            },
            error: () => (this.loading = false),
          });
      } else {
        this.groupsService
          .createGroupWithVoNameDescription(
            this.voId,
            this.groupToCreate.name,
            this.groupToCreate.description,
          )
          .subscribe({
            next: (group) => {
              this.groupIds.push(group.id);
              this.groupsToAdd.emit(this.groupIds);
            },
            error: () => (this.loading = false),
          });
      }
    } else {
      if (this.groupAssignment === 'existing') {
        this.groupIds = this.selection.selected.map((grp) => grp.id);
      }
      this.groupsToAdd.emit(this.groupIds);
    }
  }

  private filterAssignableGroups(groups: RichGroup[]): RichGroup[] {
    const assignableGroups: RichGroup[] = [];
    for (const grp of groups) {
      if (
        !(
          isGroupSynchronized(grp) ||
          hasBooleanAttributeEnabled(grp.attributes, Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING)
        ) &&
        this.guiAuthResolver.isAuthorized('addMembers_Group_List<Member>_policy', [grp])
      ) {
        assignableGroups.push(grp);
      }
    }
    return assignableGroups;
  }
}
