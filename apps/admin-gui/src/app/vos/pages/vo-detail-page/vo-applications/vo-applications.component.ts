import { ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import {
  Attribute,
  AttributeDefinition,
  AttributesManagerService,
  RegistrarManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import {
  TABLE_VO_APPLICATIONS_DETAILED,
  TABLE_VO_APPLICATIONS_NORMAL,
} from '@perun-web-apps/config/table-config';
import {
  EntityStorageService,
  GuiAuthResolver,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ApplicationsListColumnsChangeDialogComponent } from '../../../../shared/components/dialogs/applications-list-columns-change-dialog/applications-list-columns-change-dialog.component';
import { Observable } from 'rxjs';
import { AppAction } from '../../../../shared/components/application-actions/application-actions.component';

@Component({
  selector: 'app-vo-applications',
  templateUrl: './vo-applications.component.html',
  styleUrls: ['./vo-applications.component.scss'],
})
export class VoApplicationsComponent implements OnInit {
  static id = 'VoApplicationsComponent';
  @HostBinding('class.router-component') true;

  vo: Vo;

  authRights: AppAction = {
    approve: false,
    reject: false,
    delete: false,
    resend: false,
    columnSettings: false,
  };

  tableId = TABLE_VO_APPLICATIONS_NORMAL;
  detailTableId = TABLE_VO_APPLICATIONS_DETAILED;

  fedAttrs: AttributeDefinition[] = [];
  viewPreferences$: Observable<Attribute>;

  constructor(
    private registrarManager: RegistrarManagerService,
    private entityStorageService: EntityStorageService,
    private attributeService: AttributesManagerService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private translate: PerunTranslateService,
    private authResolver: GuiAuthResolver,
  ) {}

  ngOnInit(): void {
    this.vo = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.attributeService
      .getIdpAttributeDefinitions()
      .subscribe((attrDefs: AttributeDefinition[]) => {
        attrDefs.forEach((attr) => {
          if (!this.fedAttrs.includes(attr)) {
            this.fedAttrs.push(attr);
          }
          this.viewPreferences$ = this.attributeService.getVoAttributeByName(
            this.vo.id,
            'urn:perun:vo:attribute-def:def:applicationViewPreferences',
          );
        });
      });
  }

  setColumns(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = { columns: [], voId: this.vo.id, theme: 'vo-theme' };

    const dialogRef = this.dialog.open(ApplicationsListColumnsChangeDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        // Reset reference to Observable, this makes the async pipe automatically unsubscribe from the old one
        // and subscribe to the new one
        this.viewPreferences$ = this.attributeService.getVoAttributeByName(
          this.vo.id,
          'urn:perun:vo:attribute-def:def:applicationViewPreferences',
        );
      }
    });
  }

  setAuthRights(): void {
    this.authRights.approve = this.authResolver.isAuthorized(
      'vo-approveApplicationInternal_int_policy',
      [this.vo],
    );
    this.authRights.reject = this.authResolver.isAuthorized(
      'vo-rejectApplication_int_String_policy',
      [this.vo],
    );
    this.authRights.delete = this.authResolver.isAuthorized(
      'vo-deleteApplication_Application_policy',
      [this.vo],
    );
    this.authRights.resend = this.authResolver.isAuthorized(
      'vo-sendMessage_Application_MailType_String_policy',
      [this.vo],
    );
  }
}
