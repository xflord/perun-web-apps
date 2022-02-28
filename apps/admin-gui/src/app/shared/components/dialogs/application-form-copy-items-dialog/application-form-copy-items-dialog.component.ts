import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  Group,
  GroupsManagerService,
  RegistrarManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService, NotificatorService } from '@perun-web-apps/perun/services';
import { HttpErrorResponse } from '@angular/common/http';
import { RPCError } from '@perun-web-apps/perun/models';

export interface ApplicationFormCopyItemsDialogData {
  voId: number;
  groupId: number;
  theme: string;
}

@Component({
  selector: 'app-application-form-copy-items-dialog',
  templateUrl: './application-form-copy-items-dialog.component.html',
  styleUrls: ['./application-form-copy-items-dialog.component.scss'],
})
export class ApplicationFormCopyItemsDialogComponent implements OnInit {
  vos: Vo[] = [];
  groups: Group[] = [];
  selectedVo: Vo;
  selectedGroup: Group = null;
  theme: string;
  loading = false;
  private successMessage: string;
  private privilegeMessage: string;
  private noFormMessage: string;

  constructor(
    private dialogRef: MatDialogRef<ApplicationFormCopyItemsDialogComponent>,
    private voService: VosManagerService,
    private groupService: GroupsManagerService,
    private translateService: TranslateService,
    private registrarManager: RegistrarManagerService,
    private notificatorService: NotificatorService,
    private apiRequest: ApiRequestConfigurationService,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationFormCopyItemsDialogData
  ) {
    translateService
      .get('DIALOGS.APPLICATION_FORM_COPY_ITEMS.SUCCESS')
      .subscribe((res: string) => (this.successMessage = res));
    translateService
      .get('DIALOGS.APPLICATION_FORM_COPY_ITEMS.PRIVILEGE')
      .subscribe((res: string) => (this.privilegeMessage = res));
    translateService
      .get('DIALOGS.APPLICATION_FORM_COPY_ITEMS.NO_FORM')
      .subscribe((res: string) => (this.noFormMessage = res));
  }

  nameFunction: (group: Group) => string = (group: Group) => group.name;

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.translateService.get('DIALOGS.APPLICATION_FORM_COPY_ITEMS.NO_GROUP_SELECTED').subscribe(
      () => {
        this.voService.getMyVos().subscribe(
          (vos) => {
            this.vos = vos;
            this.loading = false;
          },
          () => (this.loading = false)
        );
      },
      () => (this.loading = false)
    );
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.apiRequest.dontHandleErrorForNext();
    this.loading = true;
    if (this.data.groupId) {
      // checking if the dialog is for group or Vo
      if (this.selectedGroup === null) {
        // no group selected
        this.registrarManager
          .copyFormFromVoToGroup(this.selectedVo.id, this.data.groupId)
          .subscribe(
            () => {
              this.notificatorService.showSuccess(this.successMessage);
              this.dialogRef.close(true);
            },
            (error: HttpErrorResponse) => {
              const e = error.error as RPCError;
              if (e.name === 'FormNotExistsException') {
                this.notificatorService.showError(this.noFormMessage);
              }
              if (e.name === 'PrivilegeException') {
                this.notificatorService.showError(this.privilegeMessage);
              }
              this.loading = false;
            }
          );
      } else {
        this.registrarManager
          .copyFormFromGroupToGroup(this.selectedGroup.id, this.data.groupId)
          .subscribe(
            () => {
              this.notificatorService.showSuccess(this.successMessage);
              this.dialogRef.close(true);
            },
            (error: HttpErrorResponse) => {
              const e = error.error as RPCError;
              if (e.name === 'FormNotExistsException') {
                this.notificatorService.showError(this.noFormMessage);
              }
              if (e.name === 'PrivilegeException') {
                this.notificatorService.showError(this.privilegeMessage);
              }
              this.loading = false;
            }
          );
      }
    } else {
      if (this.selectedGroup === null) {
        // no group selected
        this.registrarManager.copyFormFromVoToVo(this.selectedVo.id, this.data.voId).subscribe(
          () => {
            this.notificatorService.showSuccess(this.successMessage);
            this.dialogRef.close(true);
          },
          (error: HttpErrorResponse) => {
            const e = error.error as RPCError;
            if (e.name === 'FormNotExistsException') {
              this.notificatorService.showError(this.noFormMessage);
            }
            if (e.name === 'PrivilegeException') {
              this.notificatorService.showError(this.privilegeMessage);
            }
            this.loading = false;
          }
        );
      } else {
        this.registrarManager
          .copyFormFromGroupToVo(this.selectedGroup.id, this.data.voId)
          .subscribe(
            () => {
              this.notificatorService.showSuccess(this.successMessage);
              this.dialogRef.close(true);
            },
            (error: HttpErrorResponse) => {
              const e = error.error as RPCError;
              if (e.name === 'FormNotExistsException') {
                this.notificatorService.showError(this.noFormMessage);
              }
              if (e.name === 'PrivilegeException') {
                this.notificatorService.showError(this.privilegeMessage);
              }
              this.loading = false;
            }
          );
      }
    }
  }

  voSelected(vo: Vo): void {
    this.selectedVo = vo;
    this.cd.detectChanges();
    this.getGroups();
  }

  private getGroups(): void {
    if (this.selectedVo !== undefined) {
      this.groupService.getAllGroups(this.selectedVo.id).subscribe((groups) => {
        this.groups = groups;
      });
    } else {
      this.groups = [];
    }
    this.selectedGroup = null;
  }
}
