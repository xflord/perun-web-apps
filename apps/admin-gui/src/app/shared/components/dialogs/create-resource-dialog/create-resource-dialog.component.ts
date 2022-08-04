import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ResourcesManagerService, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

export interface CreateResourceDialogData {
  theme: string;
  facilityId: number;
}

@Component({
  selector: 'app-create-resource-dialog',
  templateUrl: './create-resource-dialog.component.html',
  styleUrls: ['./create-resource-dialog.component.scss'],
})
export class CreateResourceDialogComponent implements OnInit {
  nameCtrl: UntypedFormControl;
  descriptionCtrl: UntypedFormControl;
  vos: Vo[] = [];

  theme: string;
  loading: boolean;
  selectedVo: Vo = null;
  private successMessage: string;

  constructor(
    private dialogRef: MatDialogRef<CreateResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreateResourceDialogData,
    private notificator: NotificatorService,
    private voService: VosManagerService,
    private translate: TranslateService,
    private resourcesManager: ResourcesManagerService
  ) {
    translate
      .get('DIALOGS.CREATE_RESOURCE.SUCCESS')
      .subscribe((value: string) => (this.successMessage = value));
  }

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.voService.getAllVos().subscribe(
      (vos) => {
        this.vos = vos;
        this.loading = false;
      },
      () => (this.loading = false)
    );

    this.nameCtrl = new UntypedFormControl(null, [
      Validators.required,
      Validators.pattern('.*[\\S]+.*'),
    ]);
    this.descriptionCtrl = new UntypedFormControl('');
  }

  onSubmit(): void {
    this.loading = true;
    this.resourcesManager
      .createResource(
        this.selectedVo.id,
        this.data.facilityId,
        this.nameCtrl.value as string,
        this.descriptionCtrl.value as string
      )
      .subscribe(
        () => {
          this.notificator.showSuccess(this.successMessage);
          this.loading = false;
          this.dialogRef.close(true);
        },
        () => (this.loading = false)
      );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
