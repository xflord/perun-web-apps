import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { openClose } from '@perun-web-apps/perun/animations';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { GroupFlatNode, RPCError } from '@perun-web-apps/perun/models';

export interface MoveGroupDialogData {
  group: GroupFlatNode;
  theme: string;
}

@Component({
  selector: 'app-move-group-dialog',
  templateUrl: './move-group-dialog.component.html',
  styleUrls: ['./move-group-dialog.component.scss'],
  animations: [openClose],
})
export class MoveGroupDialogComponent implements OnInit {
  successMessage: string;
  errorMessage: string;
  toRootOptionDisabled = false;
  toGroupOptionDisabled = false;
  otherGroups: Group[] = [];
  filteredGroups: Observable<Group[]>;
  otherGroupsCtrl = new UntypedFormControl(null, [Validators.required.bind(this)]);
  moveOption: 'toGroup' | 'toRoot';
  loading = false;
  selectedGroup: Group = null;

  constructor(
    public dialogRef: MatDialogRef<MoveGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoveGroupDialogData,
    private groupService: GroupsManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private apiRequest: ApiRequestConfigurationService,
    private authResolver: GuiAuthResolver
  ) {
    this.translate
      .get('DIALOGS.MOVE_GROUP.SUCCESS')
      .subscribe((value: string) => (this.successMessage = value));
    this.translate
      .get('DIALOGS.MOVE_GROUP.ERROR')
      .subscribe((value: string) => (this.errorMessage = value));
  }

  ngOnInit(): void {
    this.loading = true;
    this.groupService.getAllGroups(this.data.group.voId).subscribe(
      (allGroups) => {
        this.otherGroups = allGroups.filter(
          (group) =>
            group.id !== this.data.group.id && group.name !== 'members' && this.canMove(group)
        );
        if (this.otherGroups.length === 0) {
          this.toGroupOptionDisabled = true;
        }
        if (
          this.data.group.parentGroupId === null ||
          !this.authResolver.isAuthorized('destination_null-moveGroup_Group_Group_policy', [
            this.data.group,
          ])
        ) {
          this.toRootOptionDisabled = true;
          this.moveOption = 'toGroup';
        }
        this.filteredGroups = this.otherGroupsCtrl.valueChanges.pipe(
          startWith(''),
          map((group: string) => (group ? this._filterGroups(group) : this.otherGroups.slice()))
        );
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  // Hack that ensures proper autocomplete value displaying
  displayFn(group: Group): string | Group {
    return group ? group.name : group;
  }

  canMove(group: Group): boolean {
    return (
      this.authResolver.isAuthorized('moveGroup_Group_Group_policy', [group, this.data.group]) &&
      this.authResolver.isAuthorized('moveGroup_Group_Group_policy', [this.data.group, group])
    );
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.loading = true;
    // FIXME this might not work in case of some race condition (other request finishes sooner)
    this.apiRequest.dontHandleErrorForNext();
    this.groupService
      .moveGroupWithDestinationGroupMovingGroup(
        this.data.group.id,
        this.otherGroupsCtrl.value ? (this.otherGroupsCtrl.value as Group).id : undefined
      )
      .subscribe(
        () => {
          this.notificator.showSuccess(this.successMessage);
          this.dialogRef.close(true);
        },
        (error: RPCError) => {
          this.notificator.showRPCError(error, this.errorMessage);
          this.dialogRef.close(false);
        }
      );
  }

  private _filterGroups(value: unknown & string): Group[] {
    // Hack that ensures proper autocomplete value displaying
    if (typeof value === 'object') {
      return [];
    }

    const filterValue = value.toLowerCase();

    return value
      ? this.otherGroups.filter((group) => group.name.toLowerCase().includes(filterValue))
      : this.otherGroups;
  }
}
