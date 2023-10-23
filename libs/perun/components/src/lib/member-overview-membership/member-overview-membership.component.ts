import { Component, Input, OnInit } from '@angular/core';
import { Attribute, AttributesManagerService, RichMember } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import {
  ChangeMemberStatusDialogComponent,
  ChangeVoExpirationDialogComponent,
} from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { RPCError } from '@perun-web-apps/perun/models';
import { MemberStatusDisabledPipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'perun-web-apps-member-overview-membership',
  templateUrl: './member-overview-membership.component.html',
  styleUrls: ['./member-overview-membership.component.css'],
  providers: [MemberStatusDisabledPipe],
})
export class MemberOverviewMembershipComponent implements OnInit {
  @Input() member: RichMember;
  @Input() voId: number;
  loading: boolean;
  expiration = '';
  expirationAtt: Attribute;
  expirationAuth = true;
  expirationRelevant = true;
  editAuth = false;

  constructor(
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver,
    private apiRequest: ApiRequestConfigurationService,
    private attributesManager: AttributesManagerService,
    private translate: PerunTranslateService,
    private notificator: NotificatorService,
    private disablePipe: MemberStatusDisabledPipe,
  ) {}

  ngOnInit(): void {
    this.editAuth =
      this.authResolver.isThisVoAdmin(this.voId) && !this.disablePipe.transform(this.member);
    this.setExpirationRelevant();
    this.refreshVoExpiration();
  }

  changeStatus(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      member: this.member,
      voId: this.voId,
      expirationAttr: this.expirationAtt,
    };

    const dialogRef = this.dialog.open(ChangeMemberStatusDialogComponent, config);
    dialogRef.afterClosed().subscribe((member: RichMember) => {
      if (member) {
        this.member = member;
        this.dialog.closeAll();
        this.setExpirationRelevant();
        this.refreshVoExpiration();
      }
    });
  }

  changeExpiration(): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      voId: this.voId,
      memberId: this.member.id,
      expirationAttr: this.expirationAtt,
      status: this.member.status,
    };

    const dialogRef = this.dialog.open(ChangeVoExpirationDialogComponent, config);
    dialogRef.afterClosed().subscribe((result: { success: boolean; member: RichMember }) => {
      if (result.success) {
        if (result.member) {
          this.member = result.member;
        }
        this.refreshVoExpiration();
        this.dialog.closeAll();
      }
    });
  }

  refreshVoExpiration(): void {
    this.loading = true;
    this.apiRequest.dontHandleErrorForNext();
    this.attributesManager
      .getMemberAttributeByName(this.member.id, Urns.MEMBER_DEF_EXPIRATION)
      .subscribe({
        next: (attr) => {
          this.expirationAtt = attr;
          this.expiration = !attr.value
            ? this.translate.instant('MEMBER_DETAIL.OVERVIEW.NEVER_EXPIRES')
            : (attr.value as string);
          this.loading = false;
        },
        error: (error: RPCError) => {
          // Can't evaluate Permission to retrieve expiration attribute beforehand
          // Hide expiration if user is not authorized to READ
          if (error.name !== 'PrivilegeException') {
            this.notificator.showError(error.name);
          } else {
            this.expirationAuth = false;
          }
          this.loading = false;
        },
      });
  }

  private setExpirationRelevant(): void {
    this.expirationRelevant = this.member.status === 'VALID' || this.member.status === 'EXPIRED';
  }
}
