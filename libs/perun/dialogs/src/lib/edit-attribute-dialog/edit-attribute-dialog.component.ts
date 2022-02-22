import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { MatTableDataSource } from '@angular/material/table';
import { AttrEntity } from '@perun-web-apps/perun/models';

export interface EditAttributeDialogData {
  entityId: number;
  entity: AttrEntity;
  attributes: Attribute[];
  secondEntity?: AttrEntity;
  secondEntityId?: number;
}

@Component({
  selector: 'perun-web-apps-edit-attribute-dialog',
  templateUrl: './edit-attribute-dialog.component.html',
  styleUrls: ['./edit-attribute-dialog.component.css'],
})
export class EditAttributeDialogComponent implements OnInit {
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Attribute>;

  constructor(
    public dialogRef: MatDialogRef<EditAttributeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditAttributeDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private attributesManager: AttributesManagerService
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Attribute>(this.data.attributes);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    switch (this.data.entity) {
      case 'vo':
        this.attributesManager
          .setVoAttributes({
            vo: this.data.entityId,
            attributes: this.data.attributes,
          })
          .subscribe(() => {
            this.onSuccess();
          });
        break;
      case 'group':
        switch (this.data.secondEntity) {
          case 'resource':
            this.attributesManager
              .setGroupResourceAttributes({
                group: this.data.entityId,
                resource: this.data.secondEntityId,
                attributes: this.data.attributes,
              })
              .subscribe(() => this.onSuccess());
            break;
          default:
            this.attributesManager
              .setGroupAttributes({
                group: this.data.entityId,
                attributes: this.data.attributes,
              })
              .subscribe(() => {
                this.onSuccess();
              });
        }
        break;
      case 'user':
        switch (this.data.secondEntity) {
          case 'facility':
            this.attributesManager
              .setUserFacilityAttributes({
                user: this.data.entityId,
                facility: this.data.secondEntityId,
                attributes: this.data.attributes,
              })
              .subscribe(() => this.onSuccess());
            break;
          default:
            this.attributesManager
              .setUserAttributes({
                user: this.data.entityId,
                attributes: this.data.attributes,
              })
              .subscribe(() => {
                this.onSuccess();
              });
        }
        break;
      case 'member':
        switch (this.data.secondEntity) {
          case 'resource':
            this.attributesManager
              .setMemberResourceAttributes({
                member: this.data.entityId,
                resource: this.data.secondEntityId,
                attributes: this.data.attributes,
              })
              .subscribe(() => this.onSuccess());
            break;
          case 'group':
            this.attributesManager
              .setMemberGroupAttributes({
                member: this.data.entityId,
                group: this.data.secondEntityId,
                attributes: this.data.attributes,
              })
              .subscribe(() => this.onSuccess());
            break;
          default:
            this.attributesManager
              .setMemberAttributes({
                member: this.data.entityId,
                attributes: this.data.attributes,
              })
              .subscribe(() => {
                this.onSuccess();
              });
        }
        break;
      case 'facility':
        this.attributesManager
          .setFacilityAttributes({
            facility: this.data.entityId,
            attributes: this.data.attributes,
          })
          .subscribe(() => {
            this.onSuccess();
          });
        break;
      case 'host':
        this.attributesManager
          .setHostAttributes({
            host: this.data.entityId,
            attributes: this.data.attributes,
          })
          .subscribe(() => {
            this.onSuccess();
          });
        break;
      case 'ues':
        this.attributesManager
          .setUserExtSourceAttributes({
            userExtSource: this.data.entityId,
            attributes: this.data.attributes,
          })
          .subscribe(() => {
            this.onSuccess();
          });
        break;
      case 'resource':
        this.attributesManager
          .setResourceAttributes({
            resource: this.data.entityId,
            attributes: this.data.attributes,
          })
          .subscribe(() => this.onSuccess());
        break;
    }
  }

  private onSuccess(): void {
    this.translate.get('DIALOGS.EDIT_ATTRIBUTES.SUCCESS').subscribe((successMessage: string) => {
      this.notificator.showSuccess(successMessage);
      this.dialogRef.close(true);
    });
  }
}
