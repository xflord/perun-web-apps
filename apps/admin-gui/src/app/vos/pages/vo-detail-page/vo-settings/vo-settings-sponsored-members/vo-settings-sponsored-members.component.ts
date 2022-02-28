import { Component, HostBinding, OnInit } from '@angular/core';
import {
  AuthzResolverService,
  MembersManagerService,
  MemberWithSponsors,
  RichUser,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_SPONSORED_MEMBERS } from '@perun-web-apps/config/table-config';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { CreateSponsoredMemberDialogComponent } from '../../../../../shared/components/dialogs/create-sponsored-member-dialog/create-sponsored-member-dialog.component';
import { GenerateSponsoredMembersDialogComponent } from '../../../../../shared/components/dialogs/generate-sponsored-members-dialog/generate-sponsored-members-dialog.component';
import {
  EntityStorageService,
  GuiAuthResolver,
  StoreService,
} from '@perun-web-apps/perun/services';
import { SponsorExistingMemberDialogComponent } from '../../../../../shared/components/dialogs/sponsor-existing-member-dialog/sponsor-existing-member-dialog.component';
import { Urns } from '@perun-web-apps/perun/urns';
import { Role } from '@perun-web-apps/perun/models';

interface AuthPrivilege {
  readAuth: boolean;
  manageAuth: boolean;
  modes: string[];
}

@Component({
  selector: 'app-vo-settings-sponsored-members',
  templateUrl: './vo-settings-sponsored-members.component.html',
  styleUrls: ['./vo-settings-sponsored-members.component.scss'],
})
export class VoSettingsSponsoredMembersComponent implements OnInit {
  static id = 'VoSponsoredMembersComponent';
  @HostBinding('class.router-component') true;
  members: MemberWithSponsors[] = [];
  createAuth: boolean;
  generateAuth: boolean;
  setSponsorshipAuth: boolean;
  routeAuth: boolean;
  findSponsorsAuth: boolean;
  voSponsors: RichUser[] = [];
  selection = new SelectionModel<MemberWithSponsors>(true, []);
  searchString = '';
  loading = false;
  tableId = TABLE_SPONSORED_MEMBERS;
  private vo: Vo;
  private attrNames: string[] = [Urns.USER_DEF_PREFERRED_MAIL];

  constructor(
    private membersManager: MembersManagerService,
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private storeService: StoreService,
    private authzResolver: AuthzResolverService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.attrNames = this.attrNames.concat(this.storeService.getLoginAttributeNames());
    this.setAuthRights();

    const availableRoles = ['SPONSOR'];
    const availableRolesPrivileges = new Map<string, AuthPrivilege>();

    this.authResolver.setRolesAuthorization(availableRoles, this.vo, availableRolesPrivileges);
    this.findSponsorsAuth = availableRolesPrivileges.get(availableRoles[0]).readAuth;

    if (this.findSponsorsAuth) {
      const attributes = [Urns.USER_DEF_PREFERRED_MAIL];

      this.authzResolver
        .getAuthzRichAdmins(Role.SPONSOR, this.vo.id, 'Vo', attributes, false, false)
        .subscribe((sponsors) => {
          this.voSponsors = sponsors;
          this.refresh();
        });
    } else {
      this.refresh();
    }
  }

  setAuthRights(): void {
    this.createAuth = this.authResolver.isAuthorized(
      'createSponsoredMember_Vo_String_Map<String_String>_String_User_LocalDate_policy',
      [this.vo, this.storeService.getPerunPrincipal().user]
    );
    this.generateAuth = this.authResolver.isAuthorized(
      'createSponsoredMembers_Vo_String_List<String>_User_policy',
      [this.vo, this.storeService.getPerunPrincipal().user]
    );
    this.setSponsorshipAuth = this.authResolver.isAuthorized(
      'setSponsorshipForMember_Member_User_LocalDate_policy',
      [this.vo, this.storeService.getPerunPrincipal().user]
    );
    if (this.members !== null && this.members.length !== 0) {
      this.routeAuth = this.authResolver.isAuthorized('getMemberById_int_policy', [
        this.vo,
        this.members[0].member,
      ]);
    }
  }

  onCreate(): void {
    const config = getDefaultDialogConfig();
    config.width = '620px';
    config.data = {
      entityId: this.vo.id,
      voId: this.vo.id,
      sponsors: this.voSponsors,
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(CreateSponsoredMemberDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.authzResolver.getPerunPrincipal().subscribe((principal) => {
          this.storeService.setPerunPrincipal(principal);
          this.refresh();
        });
      }
    });
  }

  onGenerate(): void {
    const config = getDefaultDialogConfig();
    config.width = '750px';
    config.data = {
      voId: this.vo.id,
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(GenerateSponsoredMembersDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.authzResolver.getPerunPrincipal().subscribe((principal) => {
          this.storeService.setPerunPrincipal(principal);
          this.refresh();
        });
      }
    });
  }

  onSponsorExistingMember(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = {
      voId: this.vo.id,
      theme: 'vo-theme',
    };

    const dialogRef = this.dialog.open(SponsorExistingMemberDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.authzResolver.getPerunPrincipal().subscribe((principal) => {
          this.storeService.setPerunPrincipal(principal);
          this.refresh();
        });
      }
    });
  }

  refresh(): void {
    this.loading = true;
    this.membersManager
      .getSponsoredMembersAndTheirSponsors(this.vo.id, this.attrNames)
      .subscribe((members) => {
        this.selection.clear();
        this.members = members;
        this.setAuthRights();
        this.loading = false;
      });
  }

  applyFilter(filterValue: string): void {
    this.searchString = filterValue;
  }
}
