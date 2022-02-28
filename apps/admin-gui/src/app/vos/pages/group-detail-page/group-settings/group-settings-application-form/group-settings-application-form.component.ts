import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  ApiRequestConfigurationService,
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { AddApplicationFormItemDialogComponent } from '../../../../../shared/components/dialogs/add-application-form-item-dialog/add-application-form-item-dialog.component';
import { EditApplicationFormItemDialogComponent } from '../../../../../shared/components/dialogs/edit-application-form-item-dialog/edit-application-form-item-dialog.component';
import { ApplicationFormCopyItemsDialogComponent } from '../../../../../shared/components/dialogs/application-form-copy-items-dialog/application-form-copy-items-dialog.component';
import { UpdateApplicationFormDialogComponent } from '../../../../../shared/components/dialogs/update-application-form-dialog/update-application-form-dialog.component';
import {
  ApplicationForm,
  ApplicationFormItem,
  AttributesManagerService,
  Group,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { HttpErrorResponse } from '@angular/common/http';
import { RPCError } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-group-settings-application-form',
  templateUrl: './group-settings-application-form.component.html',
  styleUrls: ['./group-settings-application-form.component.scss'],
})
export class GroupSettingsApplicationFormComponent implements OnInit {
  static id = 'GroupSettingsApplicationFormComponent';

  @HostBinding('class.router-component') true;
  @ViewChild('autoRegToggle')
  autoRegToggle: MatSlideToggle;
  loading = false;
  applicationForm: ApplicationForm;
  applicationFormItems: ApplicationFormItem[] = [];
  noApplicationForm = false;
  itemsChanged = false;
  group: Group;
  editAuth = false;
  createEmptyForm = false;
  voHasEmbeddedGroupApplication = false;
  autoRegistrationEnabled: boolean;
  changeAutoRegistration: boolean;
  refreshApplicationForm = false;
  // to recognize new items in other items' dependencies
  private idCounter = -1;

  // This counter is used to generate ids for newly added items. This fake ids are used in backend

  constructor(
    private registrarManager: RegistrarManagerService,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private apiRequest: ApiRequestConfigurationService,
    private router: Router,
    private guiAuthResolver: GuiAuthResolver,
    private attributesManager: AttributesManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.group = this.entityStorageService.getEntity();
    this.setAuth();
    // FIXME this might not work in case of some race condition (other request finishes sooner)
    this.apiRequest.dontHandleErrorForNext();
    this.registrarManager.getGroupApplicationForm(this.group.id).subscribe(
      (form) => {
        this.applicationForm = form;
        this.registrarManager.getFormItemsForGroup(this.group.id).subscribe(
          (formItems) => {
            this.applicationFormItems = formItems;
            this.attributesManager
              .getGroupAttributeByName(
                this.group.id,
                'urn:perun:group:attribute-def:virt:autoRegistrationEnabled'
              )
              .subscribe((attr) => {
                this.voHasEmbeddedGroupApplication = attr.value !== null;
                this.autoRegistrationEnabled = !!attr.value;
                this.loading = false;
              });
          },
          () => (this.loading = false)
        );
      },
      (error: HttpErrorResponse) => {
        const e = error.error as RPCError;
        if (e.name === 'FormNotExistsException') {
          this.noApplicationForm = true;
          this.loading = false;
        } else {
          this.notificator.showRPCError(e);
        }
      }
    );
  }

  setAuth(): void {
    this.editAuth = this.guiAuthResolver.isAuthorized(
      'group-updateFormItems_ApplicationForm_List<ApplicationFormItem>_policy',
      [this.group]
    );
    this.createEmptyForm = this.guiAuthResolver.isAuthorized(
      'createApplicationFormInGroup_Group_policy',
      [this.group]
    );
    this.changeAutoRegistration = this.guiAuthResolver.isAuthorized(
      'addGroupsToAutoRegistration_List<Group>_policy',
      [this.group]
    );
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
          voId: this.group.voId,
          groupId: this.group.id,
          applicationFormItem: success[1],
          theme: 'group-theme',
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
    config.data = { voId: this.group.voId, groupId: this.group.id, theme: 'group-theme' };

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
      entity: 'group',
      applicationForm: this.applicationForm,
      theme: 'group-theme',
      autoRegistrationEnabled: this.autoRegistrationEnabled,
    };

    const dialog = this.dialog.open(UpdateApplicationFormDialogComponent, config);
    dialog.afterClosed().subscribe((newForm: ApplicationForm) => {
      if (newForm) {
        this.translate
          .get('GROUP_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_SETTINGS_SUCCESS')
          .subscribe((successMessage: string) => {
            this.notificator.showSuccess(successMessage);
          });
        this.applicationForm = newForm;
      }
    });
  }

  preview(): void {
    void this.router.navigate(
      [
        '/organizations',
        this.group.voId,
        'groups',
        this.group.id,
        'settings',
        'applicationForm',
        'preview',
      ],
      { queryParams: { applicationFormItems: JSON.stringify(this.applicationFormItems) } }
    );
  }

  updateFormItems(): void {
    this.loading = true;
    this.refreshApplicationForm = true;
    this.registrarManager.getFormItemsForGroup(this.group.id).subscribe((formItems) => {
      this.applicationFormItems = formItems;
      this.itemsChanged = false;
      this.refreshApplicationForm = false;
      this.loading = false;
    });
  }

  changeItems(): void {
    this.itemsChanged = true;
  }

  createEmptyApplicationForm(): void {
    this.registrarManager.createApplicationFormInGroup(this.group.id).subscribe(() => {
      this.noApplicationForm = false;
      this.ngOnInit();
    });
  }

  save(): void {
    let i = 0;
    for (const item of this.applicationFormItems) {
      item.ordnum = i;
      if (!item.forDelete) {
        i++;
      }
    }

    // TODO reimplement this
    this.registrarManager
      .updateFormItemsForGroup({
        group: this.group.id,
        items: this.applicationFormItems,
      })
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
    this.applicationFormItems = [];
    this.itemsChanged = true;
  }

  updateAutoRegistration(): void {
    this.autoRegToggle.setDisabledState(true);
    if (this.autoRegistrationEnabled) {
      this.registrarManager.deleteGroupsFromAutoRegistration([this.group.id]).subscribe(
        () => {
          this.autoRegistrationEnabled = !this.autoRegistrationEnabled;
          this.translate
            .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_SETTINGS_SUCCESS')
            .subscribe((successMessage: string) => {
              this.notificator.showSuccess(successMessage);
            });
          this.autoRegToggle.setDisabledState(false);
        },
        () => this.autoRegToggle.setDisabledState(false)
      );
    } else {
      this.registrarManager.addGroupsToAutoRegistration([this.group.id]).subscribe(
        () => {
          this.autoRegistrationEnabled = !this.autoRegistrationEnabled;
          this.translate
            .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_SETTINGS_SUCCESS')
            .subscribe((successMessage: string) => {
              this.notificator.showSuccess(successMessage);
            });
          this.autoRegToggle.setDisabledState(false);
        },
        () => this.autoRegToggle.setDisabledState(false)
      );
    }
  }
}
