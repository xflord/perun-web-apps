import { ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import {
  Attribute,
  AttributeDefinition,
  AttributesManagerService,
  Group,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import {
  TABLE_GROUP_APPLICATIONS_DETAILED,
  TABLE_GROUP_APPLICATIONS_NORMAL,
} from '@perun-web-apps/config/table-config';
import {
  EntityStorageService,
  GuiAuthResolver,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';

import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ApplicationsListColumnsChangeDialogComponent } from '../../../../shared/components/dialogs/applications-list-columns-change-dialog/applications-list-columns-change-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AppAction } from '../../../../shared/components/application-actions/application-actions.component';

@Component({
  selector: 'app-group-applications',
  templateUrl: './group-applications.component.html',
  styleUrls: ['./group-applications.component.scss'],
})
export class GroupApplicationsComponent implements OnInit {
  static id = 'GroupApplicationsComponent';
  @HostBinding('class.router-component') true;

  group: Group;

  authRights: AppAction = {
    approve: false,
    reject: false,
    delete: false,
    resend: false,
    columnSettings: false,
  };

  tableId = TABLE_GROUP_APPLICATIONS_NORMAL;
  detailTableId = TABLE_GROUP_APPLICATIONS_DETAILED;

  fedAttrs: AttributeDefinition[] = [];
  viewPreferences$: Observable<Attribute>;

  constructor(
    private registrarManager: RegistrarManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService,
    private attributeService: AttributesManagerService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private translate: PerunTranslateService,
    private authResolver: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.group = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.attributeService
      .getIdpAttributeDefinitions()
      .subscribe((attrDefs: AttributeDefinition[]) => {
        attrDefs.forEach((attr) => {
          if (!this.fedAttrs.includes(attr)) {
            this.fedAttrs.push(attr);
          }
          this.viewPreferences$ = this.attributeService.getGroupAttributeByName(
            this.group.id,
            'urn:perun:group:attribute-def:def:applicationViewPreferences'
          );
        });
      });
  }

  setColumns(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = {
      columns: [],
      groupId: this.group.id,
      voId: this.group.voId,
      theme: 'group-theme',
    };

    const dialogRef = this.dialog.open(ApplicationsListColumnsChangeDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        // Reset reference to Observable, this makes the async pipe automatically unsubscribe from the old one
        // and subscribe to the new one
        this.viewPreferences$ = this.attributeService.getGroupAttributeByName(
          this.group.id,
          'urn:perun:group:attribute-def:def:applicationViewPreferences'
        );
      }
    });
  }

  setAuthRights(): void {
    this.authRights.approve = this.authResolver.isAuthorized(
      'group-approveApplicationInternal_int_policy',
      [this.group]
    );
    this.authRights.reject = this.authResolver.isAuthorized(
      'group-rejectApplication_int_String_policy',
      [this.group]
    );
    this.authRights.delete = this.authResolver.isAuthorized(
      'group-deleteApplication_Application_policy',
      [this.group]
    );
    this.authRights.resend = this.authResolver.isAuthorized(
      'group-sendMessage_Application_MailType_String_policy',
      [this.group]
    );
  }
}
