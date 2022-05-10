import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { Service, ServicesManagerService } from '@perun-web-apps/perun/openapi';

export interface CreateServiceDialogData {
  theme: string;
  service: Service;
}
@Component({
  selector: 'app-create-service-dialog',
  templateUrl: './create-edit-service-dialog.component.html',
  styleUrls: ['./create-edit-service-dialog.component.scss'],
})
export class CreateEditServiceDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<CreateEditServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreateServiceDialogData,
    private serviceManager: ServicesManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

  theme: string;
  loading = false;

  description: string;
  status = true;

  nameControl = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]);
  delayControl = new FormControl(10, [Validators.pattern('^[0-9]*$')]);
  recurrenceControl = new FormControl(2, [Validators.pattern('^[0-9]*$')]);
  pathControl = new FormControl('', [Validators.required]);

  asEdit = false;
  title: string;
  buttonText: string;

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.asEdit = this.data.service !== undefined;

    if (this.asEdit) {
      this.nameControl.setValue(this.data.service.name);
      this.description = this.data.service.description;
      this.delayControl.setValue(this.data.service.delay);
      this.recurrenceControl.setValue(this.data.service.recurrence);
      this.pathControl.setValue(this.data.service.script);
      this.status = this.data.service.enabled;

      this.title = this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.EDIT_TITLE');
      this.buttonText = this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.EDIT');
    } else {
      this.title = this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.CREATE_TITLE');
      this.buttonText = this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.CREATE');
    }
  }

  onCreate() {
    this.loading = true;
    this.serviceManager
      .createServiceWithService({
        service: {
          name: this.nameControl.value,
          description: this.description,
          delay: this.delayControl.value,
          recurrence: this.recurrenceControl.value,
          enabled: this.status,
          script: this.pathControl.value,
          useExpiredMembers: false,
          id: 0,
          beanName: '',
        },
      })
      .subscribe(() => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.CREATE_SUCCESS')
        );
        this.dialogRef.close(true);
        this.loading = false;
      });
  }

  onEdit() {
    this.loading = true;
    this.serviceManager
      .updateService({
        service: {
          name: this.nameControl.value,
          description: this.description,
          delay: this.delayControl.value,
          recurrence: this.recurrenceControl.value,
          enabled: this.status,
          script: this.pathControl.value,
          useExpiredMembers: this.data.service.useExpiredMembers,
          id: this.data.service.id,
          beanName: this.data.service.beanName,
        },
      })
      .subscribe(() => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.EDIT_SUCCESS')
        );
        this.dialogRef.close(true);
        this.loading = false;
      });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  makePath() {
    const path = './'.concat(this.nameControl.value);
    this.pathControl.setValue(path);
  }
}
