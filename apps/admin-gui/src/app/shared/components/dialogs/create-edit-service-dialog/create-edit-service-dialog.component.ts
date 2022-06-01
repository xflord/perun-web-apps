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
  theme: string;
  loading = false;

  description: string;
  status = true;
  propagateExpiredMembers = true;

  nameControl = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]+$')]);
  delayControl = new FormControl(10, [Validators.pattern('^[0-9]*$')]);
  recurrenceControl = new FormControl(2, [Validators.pattern('^[0-9]*$')]);
  pathControl = new FormControl('', [Validators.required]);

  asEdit = false;
  title: string;
  buttonText: string;

  constructor(
    private dialogRef: MatDialogRef<CreateEditServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreateServiceDialogData,
    private serviceManager: ServicesManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

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
      this.propagateExpiredMembers = this.data.service.useExpiredMembers;

      this.title = this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.EDIT_TITLE') as string;
      this.buttonText = this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.EDIT') as string;
    } else {
      this.title = this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.CREATE_TITLE') as string;
      this.buttonText = this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.CREATE') as string;
    }
  }

  onCreate(): void {
    this.loading = true;
    this.serviceManager
      .createServiceWithService({
        service: {
          name: this.nameControl.value as string,
          description: this.description,
          delay: this.delayControl.value as number,
          recurrence: this.recurrenceControl.value as number,
          enabled: this.status,
          script: this.pathControl.value as string,
          useExpiredMembers: this.propagateExpiredMembers,
          id: 0,
          beanName: '',
        },
      })
      .subscribe(
        () => {
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.CREATE_SUCCESS') as string
          );
          this.dialogRef.close(true);
          this.loading = false;
        },
        () => (this.loading = false)
      );
  }

  onEdit(): void {
    this.loading = true;
    this.serviceManager
      .updateService({
        service: {
          name: this.nameControl.value as string,
          description: this.description,
          delay: this.delayControl.value as number,
          recurrence: this.recurrenceControl.value as number,
          enabled: this.status,
          script: this.pathControl.value as string,
          useExpiredMembers: this.propagateExpiredMembers,
          id: this.data.service.id,
          beanName: this.data.service.beanName,
        },
      })
      .subscribe(
        () => {
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.CREATE_EDIT_SERVICE.EDIT_SUCCESS') as string
          );
          this.dialogRef.close(true);
          this.loading = false;
        },
        () => (this.loading = false)
      );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  makePath(): void {
    const path = './'.concat(this.nameControl.value as string);
    this.pathControl.setValue(path);
  }
}
