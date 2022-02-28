import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UpdateApplicationFormDialogComponent } from '../../../../../shared/components/dialogs/update-application-form-dialog/update-application-form-dialog.component';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationFormCopyItemsDialogComponent } from '../../../../../shared/components/dialogs/application-form-copy-items-dialog/application-form-copy-items-dialog.component';
import { AddApplicationFormItemDialogComponent } from '../../../../../shared/components/dialogs/add-application-form-item-dialog/add-application-form-item-dialog.component';
import { EditApplicationFormItemDialogComponent } from '../../../../../shared/components/dialogs/edit-application-form-item-dialog/edit-application-form-item-dialog.component';
import {
  ApplicationForm,
  ApplicationFormItem,
  RegistrarManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-vo-settings-application-form',
  templateUrl: './vo-settings-application-form.component.html',
  styleUrls: ['./vo-settings-application-form.component.scss'],
})
export class VoSettingsApplicationFormComponent implements OnInit {
  static id = 'VoSettingsApplicationFormComponent';
  @HostBinding('class.router-component') true;
  loading = false;
  applicationForm: ApplicationForm;
  applicationFormItems: ApplicationFormItem[] = [];
  itemsChanged = false;
  editAuth: boolean;
  displayedColumns: string[] = [];
  refreshApplicationForm = false;
  private vo: Vo;

  // This counter is used to generate ids for newly added items. This fake ids are used in backend
  // to recognize new items in other items' dependencies
  private idCounter = -1;

  constructor(
    private registrarManager: RegistrarManagerService,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private router: Router,
    private authResolver: GuiAuthResolver,
    private voService: VosManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.setAuthRights();
    this.registrarManager.getVoApplicationForm(this.vo.id).subscribe((form) => {
      this.applicationForm = form;
      this.registrarManager.getFormItemsForVo(this.vo.id).subscribe((formItems) => {
        this.applicationFormItems = formItems;
        this.loading = false;
      });
    });
  }

  add(): void {
    let config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      applicationFormItems: this.applicationFormItems,
      fakeId: this.idCounter--,
    };

    const dialog = this.dialog.open(AddApplicationFormItemDialogComponent, config);
    dialog.afterClosed().subscribe((success: ApplicationFormItem[]) => {
      // success is field contains of two items: first is applicationFormItems with new item in it,
      // second item is new Application Form Item
      if (success) {
        this.applicationFormItems = Object.assign([], success[0]);

        config = getDefaultDialogConfig();
        config.width = '600px';
        config.height = '600px';
        config.data = {
          voId: this.vo.id,
          applicationFormItem: success[1],
          theme: 'vo-theme',
          allItems: this.applicationFormItems,
        };

        this.dialog.open(EditApplicationFormItemDialogComponent, config);
        this.itemsChanged = true;
      }
    });
  }

  copy(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { voId: this.vo.id, theme: 'vo-theme' };

    const dialog = this.dialog.open(ApplicationFormCopyItemsDialogComponent, config);
    dialog.afterClosed().subscribe((copyFrom) => {
      if (copyFrom) {
        this.updateFormItems();
      }
    });
  }

  settings(): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      entity: 'vo',
      applicationForm: this.applicationForm,
      theme: 'vo-theme',
    };

    const dialog = this.dialog.open(UpdateApplicationFormDialogComponent, config);
    dialog.afterClosed().subscribe((newForm: ApplicationForm) => {
      if (newForm) {
        this.translate
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_SETTINGS_SUCCESS')
          .subscribe((successMessage: string) => {
            this.notificator.showSuccess(successMessage);
          });
        this.applicationForm = newForm;
      }
    });
  }

  preview(): void {
    void this.router.navigate(
      ['/organizations', this.vo.id, 'settings', 'applicationForm', 'preview'],
      {
        queryParams: { applicationFormItems: JSON.stringify(this.applicationFormItems) },
      }
    );
  }

  updateFormItems(): void {
    this.loading = true;
    this.refreshApplicationForm = true;
    this.registrarManager.getFormItemsForVo(this.vo.id).subscribe((formItems) => {
      this.applicationFormItems = formItems;
      this.itemsChanged = false;
      this.setAuthRights();
      this.refreshApplicationForm = false;
      this.loading = false;
    });
  }

  changeItems(): void {
    this.itemsChanged = true;
  }

  save(): void {
    let i = 0;
    for (const item of this.applicationFormItems) {
      item.ordnum = i;
      if (!item.forDelete) {
        i++;
      }
    }

    this.registrarManager
      .updateFormItemsForVo({ vo: this.vo.id, items: this.applicationFormItems })
      .subscribe(() => {
        this.translate
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_APPLICATION_FORM_ITEMS_SUCCESS')
          .subscribe((successMessage: string) => {
            this.notificator.showSuccess(successMessage);
          });
        this.updateFormItems();
      });
  }

  clear(): void {
    this.applicationFormItems.forEach((appFormItem) => (appFormItem.forDelete = true));
    this.itemsChanged = true;
  }

  private setAuthRights(): void {
    this.editAuth = this.authResolver.isAuthorized(
      'vo-updateFormItems_ApplicationForm_List<ApplicationFormItem>_policy',
      [this.vo]
    );
    this.displayedColumns = this.editAuth
      ? [
          'drag',
          'shortname',
          'type',
          'disabled',
          'hidden',
          'preview',
          'managegroups',
          'edit',
          'delete',
        ]
      : ['shortname', 'type', 'disabled', 'hidden', 'preview', 'managegroups'];
  }
}
