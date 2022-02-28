import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { DeleteNotificationDialogComponent } from '../../../../../shared/components/dialogs/delete-notification-dialog/delete-notification-dialog.component';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { EditEmailFooterDialogComponent } from '../../../../../shared/components/dialogs/edit-email-footer-dialog/edit-email-footer-dialog.component';
import { AddEditNotificationDialogComponent } from '../../../../../shared/components/dialogs/add-edit-notification-dialog/add-edit-notification-dialog.component';
import { NotificationsCopyMailsDialogComponent } from '../../../../../shared/components/dialogs/notifications-copy-mails-dialog/notifications-copy-mails-dialog.component';
import {
  ApplicationForm,
  ApplicationMail,
  RegistrarManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { createNewApplicationMail, getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { TABLE_VO_SETTINGS_NOTIFICATIONS } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-vo-settings-notifications',
  templateUrl: './vo-settings-notifications.component.html',
  styleUrls: ['./vo-settings-notifications.component.scss'],
})
export class VoSettingsNotificationsComponent implements OnInit {
  @HostBinding('class.router-component') true;

  loading = false;
  vo: Vo;
  applicationMails: ApplicationMail[] = [];
  selection = new SelectionModel<ApplicationMail>(true, []);
  tableId = TABLE_VO_SETTINGS_NOTIFICATIONS;
  displayedColumns: string[] = [];
  addAuth: boolean;
  removeAuth: boolean;
  copyAuth: boolean;
  private applicationForm: ApplicationForm;

  constructor(
    private route: ActivatedRoute,
    private registrarService: RegistrarManagerService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private authResolver: GuiAuthResolver,
    private voService: VosManagerService,
    private store: StoreService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.registrarService.getVoApplicationForm(this.vo.id).subscribe((form) => {
      this.applicationForm = form;
      this.registrarService.getApplicationMailsForVo(this.vo.id).subscribe((mails) => {
        this.applicationMails = mails;
        this.loading = false;
      });
    });
  }

  setAuthRights(): void {
    this.addAuth = this.authResolver.isAuthorized(
      'vo-addMail_ApplicationForm_ApplicationMail_policy',
      [this.vo]
    );
    this.removeAuth = this.authResolver.isAuthorized(
      'vo-deleteMailById_ApplicationForm_Integer_policy',
      [this.vo]
    );
    this.copyAuth = this.authResolver.isAuthorized('copyMailsFromVoToVo_Vo_Vo_policy', [this.vo]);

    this.displayedColumns = this.removeAuth
      ? ['select', 'id', 'mailType', 'appType', 'send']
      : ['id', 'mailType', 'appType', 'send'];
  }

  add(): void {
    const supportedLangs = this.store.get('supported_languages') as string[];
    const applicationMail: ApplicationMail = createNewApplicationMail(supportedLangs);
    applicationMail.formId = this.applicationForm.id;

    const config = getDefaultDialogConfig();
    config.width = '1400px';
    config.height = '700px';
    config.data = {
      theme: 'vo-theme',
      voId: this.vo.id,
      createMailNotification: true,
      applicationMail: applicationMail,
      applicationMails: this.applicationMails,
    };

    const dialog = this.dialog.open(AddEditNotificationDialogComponent, config);
    dialog.afterClosed().subscribe((success) => {
      if (success) {
        this.translate
          .get('VO_DETAIL.SETTINGS.NOTIFICATIONS.ADD_SUCCESS')
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
    config.data = { voId: this.vo.id, mails: this.selection.selected, theme: 'vo-theme' };

    const dialog = this.dialog.open(DeleteNotificationDialogComponent, config);
    dialog.afterClosed().subscribe((success) => {
      if (success) {
        this.translate
          .get('VO_DETAIL.SETTINGS.NOTIFICATIONS.DELETE_SUCCESS')
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
    config.data = { voId: this.vo.id, theme: 'vo-theme' };

    const dialog = this.dialog.open(NotificationsCopyMailsDialogComponent, config);
    dialog.afterClosed().subscribe((copyFrom) => {
      if (copyFrom) {
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  changeEmailFooter(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { voId: this.vo.id, theme: 'vo-theme' };

    this.dialog.open(EditEmailFooterDialogComponent, config);
  }

  changeSelection(selection: SelectionModel<ApplicationMail>): void {
    this.selection = selection;
  }

  private updateTable(): void {
    this.loading = true;
    this.registrarService.getApplicationMailsForVo(this.vo.id).subscribe((mails) => {
      this.applicationMails = mails;
      this.loading = false;
    });
  }
}
