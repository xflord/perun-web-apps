import { Component, HostBinding, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ApiRequestConfigurationService,
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { AddEditNotificationDialogComponent } from '../../../../../shared/components/dialogs/add-edit-notification-dialog/add-edit-notification-dialog.component';
import { DeleteNotificationDialogComponent } from '../../../../../shared/components/dialogs/delete-notification-dialog/delete-notification-dialog.component';
import { NotificationsCopyMailsDialogComponent } from '../../../../../shared/components/dialogs/notifications-copy-mails-dialog/notifications-copy-mails-dialog.component';
import { EditEmailFooterDialogComponent } from '../../../../../shared/components/dialogs/edit-email-footer-dialog/edit-email-footer-dialog.component';
import {
  ApplicationForm,
  ApplicationMail,
  AttributesManagerService,
  Group,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { createNewApplicationMail, getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { TABLE_GROUP_SETTINGS_NOTIFICATIONS } from '@perun-web-apps/config/table-config';
import { Urns } from '@perun-web-apps/perun/urns';
import { RPCError } from '@perun-web-apps/perun/models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-group-settings-notifications',
  templateUrl: './group-settings-notifications.component.html',
  styleUrls: ['./group-settings-notifications.component.scss'],
})
export class GroupSettingsNotificationsComponent implements OnInit {
  @HostBinding('class.router-component') true;
  loading = false;
  applicationForm: ApplicationForm;
  applicationMails: ApplicationMail[] = [];
  selection = new SelectionModel<ApplicationMail>(true, []);
  noApplicationForm = false;
  group: Group;
  editEmailFooterAuth = false;
  addAuth = false;
  removeAuth = false;
  copyAuth = false;
  createFormAuth = false;
  displayedColumns: string[] = [];
  tableId = TABLE_GROUP_SETTINGS_NOTIFICATIONS;

  constructor(
    private registrarService: RegistrarManagerService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private apiRequest: ApiRequestConfigurationService,
    private notificator: NotificatorService,
    public guiAuthResolver: GuiAuthResolver,
    private attributesService: AttributesManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.group = this.entityStorageService.getEntity();
    this.setAuthRights();

    // FIXME this might not work in case of some race condition (other request finishes sooner)
    this.apiRequest.dontHandleErrorForNext();
    this.registrarService.getGroupApplicationForm(this.group.id).subscribe(
      (form) => {
        this.applicationForm = form;
        this.registrarService.getApplicationMailsForGroup(this.group.id).subscribe((mails) => {
          this.applicationMails = mails;
          //not implemented in authorization....probably must be hardcoded
          this.apiRequest.dontHandleErrorForNext();
          this.attributesService
            .getGroupAttributeByName(this.group.id, Urns.GROUP_DEF_EXPIRATION_RULES)
            .subscribe(
              () => {
                this.setAuthRights();
                this.loading = false;
              },
              (error: RPCError) => {
                if (error.name !== 'HttpErrorResponse') {
                  this.notificator.showRPCError(error);
                }
                this.setAuthRights();
                this.loading = false;
              }
            );
        });
      },
      (error: HttpErrorResponse) => {
        const e = error.error as RPCError;
        if (e.name === 'FormNotExistsException') {
          this.noApplicationForm = true;
          this.setAuthRights();
          this.loading = false;
        } else {
          this.notificator.showRPCError(e);
        }
      }
    );
  }

  setAuthRights(): void {
    this.createFormAuth = this.guiAuthResolver.isAuthorized(
      'createApplicationFormInGroup_Group_policy',
      [this.group]
    );
    this.addAuth = this.guiAuthResolver.isAuthorized(
      'group-addMail_ApplicationForm_ApplicationMail_policy',
      [this.group]
    );
    this.removeAuth = this.guiAuthResolver.isAuthorized(
      'group-deleteMailById_ApplicationForm_Integer_policy',
      [this.group]
    );
    this.copyAuth = this.guiAuthResolver.isAuthorized(
      'copyMailsFromVoToGroup_Vo_Group_boolean_policy',
      [this.group]
    );
    this.displayedColumns = this.removeAuth
      ? ['select', 'id', 'mailType', 'appType', 'send']
      : ['id', 'mailType', 'appType', 'send'];
  }

  add(): void {
    const applicationMail: ApplicationMail = createNewApplicationMail();
    applicationMail.formId = this.applicationForm.id;

    const config = getDefaultDialogConfig();
    config.width = '1400px';
    config.height = '700px';
    config.data = {
      theme: 'group-theme',
      voId: this.group.voId,
      groupId: this.group.id,
      createMailNotification: true,
      applicationMail: applicationMail,
      applicationMails: this.applicationMails,
    };

    const dialog = this.dialog.open(AddEditNotificationDialogComponent, config);
    dialog.afterClosed().subscribe((success) => {
      if (success) {
        this.translate
          .get('GROUP_DETAIL.SETTINGS.NOTIFICATIONS.ADD_SUCCESS')
          .subscribe((text: string) => {
            this.notificator.showSuccess(text);
          });
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  remove(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      voId: this.group.voId,
      groupId: this.group.id,
      mails: this.selection.selected,
      theme: 'group-theme',
    };

    const dialog = this.dialog.open(DeleteNotificationDialogComponent, config);
    dialog.afterClosed().subscribe((success) => {
      if (success) {
        this.translate
          .get('GROUP_DETAIL.SETTINGS.NOTIFICATIONS.DELETE_SUCCESS')
          .subscribe((text: string) => {
            this.notificator.showSuccess(text);
          });
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  copy(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { voId: this.group.voId, groupId: this.group.id, theme: 'group-theme' };

    const dialog = this.dialog.open(NotificationsCopyMailsDialogComponent, config);
    dialog.afterClosed().subscribe((copyFrom) => {
      if (copyFrom) {
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  updateTable(): void {
    this.loading = true;
    this.registrarService.getApplicationMailsForGroup(this.group.id).subscribe((mails) => {
      this.applicationMails = mails;
      this.loading = false;
    });
  }

  changeEmailFooter(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { voId: this.group.voId, groupId: this.group.id, theme: 'group-theme' };

    this.dialog.open(EditEmailFooterDialogComponent, config);
  }

  changeSelection(selection: SelectionModel<ApplicationMail>): void {
    this.selection = selection;
  }

  createEmptyApplicationForm(): void {
    this.registrarService.createApplicationFormInGroup(this.group.id).subscribe(() => {
      this.noApplicationForm = false;
      this.ngOnInit();
    });
  }
}
