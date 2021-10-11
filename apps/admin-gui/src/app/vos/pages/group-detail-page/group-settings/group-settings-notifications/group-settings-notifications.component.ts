import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import {SelectionModel} from '@angular/cdk/collections';
import {
  AddEditNotificationDialogComponent
} from '../../../../../shared/components/dialogs/add-edit-notification-dialog/add-edit-notification-dialog.component';
import {
  DeleteNotificationDialogComponent
} from '../../../../../shared/components/dialogs/delete-notification-dialog/delete-notification-dialog.component';
import {
  NotificationsCopyMailsDialogComponent
} from '../../../../../shared/components/dialogs/notifications-copy-mails-dialog/notifications-copy-mails-dialog.component';
import {
  EditEmailFooterDialogComponent
} from '../../../../../shared/components/dialogs/edit-email-footer-dialog/edit-email-footer-dialog.component';
import {
  ApplicationForm,
  ApplicationMail, AttributesManagerService,
  Group,
  GroupsManagerService,
  RegistrarManagerService
} from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService } from '@perun-web-apps/perun/services';
import { createNewApplicationMail, getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { PageEvent } from '@angular/material/paginator';
import {
  TABLE_GROUP_SETTINGS_NOTIFICATIONS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { Urns } from '@perun-web-apps/perun/urns';

@Component({
  selector: 'app-group-settings-notifications',
  templateUrl: './group-settings-notifications.component.html',
  styleUrls: ['./group-settings-notifications.component.scss']
})
export class GroupSettingsNotificationsComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private route: ActivatedRoute,
    private registrarService: RegistrarManagerService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private apiRequest: ApiRequestConfigurationService,
    private tableConfigService: TableConfigService,
    private notificator: NotificatorService,
    private groupsService: GroupsManagerService,
    public guiAuthResolver: GuiAuthResolver,
    private attributesService: AttributesManagerService) {
  }

  loading = false;
  voId: number;
  groupId: number;
  applicationForm: ApplicationForm;
  applicationMails: ApplicationMail[] = [];
  selection = new SelectionModel<ApplicationMail>(true, []);
  noApplicationForm = false;
  pageSize: number;
  group: Group;
  editEmailFooterAuth = false;
  addAuth = false;
  removeAuth = false;
  copyAuth = false;
  createFormAuth = false;
  displayedColumns: string[] = [];

  private tableId = TABLE_GROUP_SETTINGS_NOTIFICATIONS;

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);

    this.loading = true;
    this.route.parent.parent.params.subscribe(params => {
      this.voId = params['voId'];
      this.groupId = params['groupId'];

      // FIXME this might not work in case of some race condition (other request finishes sooner)
      this.groupsService.getGroupById(this.groupId).subscribe(group => {
        this.group = group;
        this.apiRequest.dontHandleErrorForNext();
        this.registrarService.getGroupApplicationForm(this.groupId).subscribe(form => {
          this.applicationForm = form;
          this.registrarService.getApplicationMailsForGroup(this.groupId).subscribe(mails => {
            this.applicationMails = mails;
            //not implemented in authorization....probably must be hardcoded
            this.apiRequest.dontHandleErrorForNext();
            this.attributesService.getGroupAttributeByName(this.groupId, Urns.GROUP_DEF_EXPIRATION_RULES).subscribe(() => {
              this.setAuthRights();
              this.loading = false;
            }, error => {
              if (error.name !== 'HttpErrorResponse') {
                this.notificator.showRPCError(error)
              }
              this.setAuthRights();
              this.loading = false;
            });
          });
        }, error => {
          if (error.error.name === 'FormNotExistsException') {
            this.noApplicationForm = true;
            this.setAuthRights();
            this.loading = false;
          } else {
            this.notificator.showRPCError(error);
          }
        });
      });
    });
  }

  setAuthRights() {
    this.createFormAuth = this.guiAuthResolver.isAuthorized('createApplicationFormInGroup_Group_policy', [this.group]);
    this.addAuth = this.guiAuthResolver.isAuthorized('group-addMail_ApplicationForm_ApplicationMail_policy', [this.group]);
    this.removeAuth = this.guiAuthResolver.isAuthorized('group-deleteMailById_ApplicationForm_Integer_policy', [this.group])
    this.copyAuth = this.guiAuthResolver.isAuthorized('copyMailsFromVoToGroup_Vo_Group_boolean_policy', [this.group]);
    this.displayedColumns = this.removeAuth ? ['select', 'id', 'mailType', 'appType', 'send'] : ['id', 'mailType', 'appType', 'send'];
  }

  add() {
    const applicationMail: ApplicationMail = createNewApplicationMail();
    applicationMail.formId = this.applicationForm.id;

    const config = getDefaultDialogConfig();
    config.width = '1400px';
    config.height = '700px';
    config.data = {
      theme: 'group-theme',
      voId: this.voId,
      groupId: this.groupId,
      createMailNotification: true,
      applicationMail: applicationMail,
      applicationMails: this.applicationMails
    };

    const dialog = this.dialog.open(AddEditNotificationDialogComponent, config);
    dialog.afterClosed().subscribe(success => {
      if (success) {
        this.translate.get('GROUP_DETAIL.SETTINGS.NOTIFICATIONS.ADD_SUCCESS').subscribe(text => {
          this.notificator.showSuccess(text);
        });
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  remove() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { voId: this.voId, groupId: this.groupId, mails: this.selection.selected, theme: 'group-theme' };

    const dialog = this.dialog.open(DeleteNotificationDialogComponent, config);
    dialog.afterClosed().subscribe(success => {
      if (success) {
        this.translate.get('GROUP_DETAIL.SETTINGS.NOTIFICATIONS.DELETE_SUCCESS').subscribe(text => {
          this.notificator.showSuccess(text);
        });
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  copy() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { voId: this.voId, groupId: this.groupId, theme: 'group-theme' };

    const dialog = this.dialog.open(NotificationsCopyMailsDialogComponent, config);
    dialog.afterClosed().subscribe(copyFrom => {
      if (copyFrom) {
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  updateTable() {
    this.loading = true;
    this.registrarService.getApplicationMailsForGroup(this.groupId).subscribe(mails => {
      this.applicationMails = mails;
      this.loading = false;
    });
  }

  changeEmailFooter() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { voId: this.voId, groupId: this.groupId, theme: 'group-theme' };

    this.dialog.open(EditEmailFooterDialogComponent, config);
  }

  changeSelection(selection: SelectionModel<ApplicationMail>) {
    this.selection = selection;
  }

  createEmptyApplicationForm() {
    this.registrarService.createApplicationFormInGroup(this.groupId).subscribe(() => {
      this.noApplicationForm = false;
      this.ngOnInit();
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
