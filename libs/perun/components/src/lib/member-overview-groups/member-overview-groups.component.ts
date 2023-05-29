import { Component, Input, OnInit } from '@angular/core';
import {
  Attribute,
  Group,
  GroupsManagerService,
  RichGroup,
  RichMember,
} from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, getRecentlyVisitedIds } from '@perun-web-apps/perun/utils';
import { Urns } from '@perun-web-apps/perun/urns';
import { GuiAuthResolver, PerunTranslateService } from '@perun-web-apps/perun/services';
import {
  ChangeGroupExpirationDialogComponent,
  ChangeMemberStatusDialogComponent,
} from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-member-overview-groups',
  templateUrl: './member-overview-groups.component.html',
  styleUrls: ['./member-overview-groups.component.css'],
})
export class MemberOverviewGroupsComponent implements OnInit {
  @Input() voId: number;
  @Input() member: RichMember;
  @Input() requiresGroupSelect = true;
  loading: boolean;
  groups: Group[] = [];
  selectedGroup: Group;
  selectedMember: RichMember;
  expiration = '';
  expirationAtt: Attribute;
  editAuth = false;
  showExpiration = true;

  constructor(
    private groupsManager: GroupsManagerService,
    public authResolver: GuiAuthResolver,
    private translate: PerunTranslateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.groupsManager.getMemberGroups(this.member.id).subscribe((groups) => {
      this.groups = groups;
      if (this.groups.length !== 0) {
        const initiallySelectedGroup = this.findInitiallySelectedGroupId();
        this.groupIsSelected(initiallySelectedGroup);
      }
      this.loading = false;
    });
  }

  findInitiallySelectedGroupId(): Group {
    const recentIds = getRecentlyVisitedIds('groups');
    if (recentIds) {
      const mostRecentGroup = this.groups.find((group) => group.id === recentIds[0]);
      if (mostRecentGroup) {
        return mostRecentGroup;
      }
    }
    return this.groups[0];
  }

  groupIsSelected(group: RichGroup): void {
    this.loading = true;
    this.selectedGroup = group;
    this.editAuth =
      this.authResolver.isThisVoAdmin(this.voId) ||
      this.authResolver.isThisGroupAdmin(this.selectedGroup.id);

    this.groupsManager
      .getGroupRichMembersByIds(
        this.selectedGroup.id,
        [this.member.id],
        [Urns.MEMBER_DEF_GROUP_EXPIRATION]
      )
      .subscribe((members) => {
        this.selectedMember = members[0];
        this.expirationAtt = this.selectedMember.memberAttributes.find(
          (att) => att.baseFriendlyName === 'groupMembershipExpiration'
        );
        if (this.expirationAtt) {
          this.expiration = !this.expirationAtt.value
            ? this.translate.instant('MEMBER_DETAIL.OVERVIEW.NEVER_EXPIRES')
            : (this.expirationAtt.value as string);
        } else {
          this.showExpiration = false;
        }
        this.loading = false;
      });
  }

  changeExpiration(): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      memberId: this.member.id,
      groupId: this.selectedGroup.id,
      expirationAttr: this.expirationAtt,
      status: this.selectedMember.groupStatus,
    };

    const dialogRef = this.dialog.open(ChangeGroupExpirationDialogComponent, config);
    dialogRef.afterClosed().subscribe((expChanged: boolean) => {
      if (expChanged) {
        this.groupIsSelected(this.selectedGroup);
      }
    });
  }

  changeStatus(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      member: this.selectedMember,
      voId: this.voId,
      groupId: this.selectedGroup.id,
      expirationAttr: this.expirationAtt,
    };

    const dialogRef = this.dialog.open(ChangeMemberStatusDialogComponent, config);
    dialogRef.afterClosed().subscribe((member: RichMember) => {
      if (member) {
        this.selectedMember = member;
        this.groupIsSelected(this.selectedGroup);
      }
    });
  }
}
