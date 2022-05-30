import { Component, Input, OnChanges } from '@angular/core';
import { Attribute, AttributesManagerService, RichMember, Vo } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import {
  ChangeMemberStatusDialogComponent,
  ChangeVoExpirationDialogComponent,
} from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RPCError } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-member-overview-membership',
  templateUrl: './member-overview-membership.component.html',
  styleUrls: ['./member-overview-membership.component.css'],
})
export class MemberOverviewMembershipComponent implements OnChanges {
  @Input()
  member: RichMember;
  @Input()
  vo: Vo;
  voMembershipDataSource = new MatTableDataSource<string>();
  voExpiration = '';
  voExpirationAtt: Attribute;
  loading: boolean;
  displayedColumns = ['attName', 'attValue'];

  constructor(
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver,
    private apiRequest: ApiRequestConfigurationService,
    private attributesManager: AttributesManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService
  ) {}

  ngOnChanges(): void {
    this.voMembershipDataSource = new MatTableDataSource<string>(['Status', 'Expiration']);
    this.refreshVoExpiration();
  }

  changeStatus(): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = { member: this.member, voId: this.vo.id };
    const oldStatus = this.member.status;

    const dialogRef = this.dialog.open(ChangeMemberStatusDialogComponent, config);
    dialogRef.afterClosed().subscribe((member: RichMember) => {
      if (member) {
        this.member = member;
        if (
          (oldStatus === 'VALID' &&
            (member.status === 'EXPIRED' || member.status === 'DISABLED')) ||
          member.status === 'VALID'
        ) {
          this.changeVoExpiration(true);
        }
      }
    });
  }

  changeVoExpiration(statusChanged: boolean): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      voId: this.vo.id,
      memberId: this.member.id,
      expirationAttr: this.voExpirationAtt,
      status: this.member.status,
      statusChanged: statusChanged,
    };

    const dialogRef = this.dialog.open(ChangeVoExpirationDialogComponent, config);
    dialogRef.afterClosed().subscribe((result: { success: boolean; member: RichMember }) => {
      if (result.success) {
        if (result.member) {
          this.member = result.member;
        }
        this.refreshVoExpiration();
      }
    });
  }

  refreshVoExpiration(): void {
    this.loading = true;
    this.apiRequest.dontHandleErrorForNext();
    this.attributesManager
      .getMemberAttributeByName(this.member.id, Urns.MEMBER_DEF_EXPIRATION)
      .subscribe(
        (attr) => {
          this.voExpirationAtt = attr;
          this.voExpiration = !attr.value
            ? (this.translate.instant('MEMBER_DETAIL.OVERVIEW.NEVER_EXPIRES') as string)
            : (attr.value as string);
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          const e = error.error as RPCError;
          if (e.name !== 'PrivilegeException') {
            this.notificator.showError(e.name);
          } else {
            this.voMembershipDataSource = new MatTableDataSource<string>(['Status']);
          }
          this.loading = false;
        }
      );
  }
}
