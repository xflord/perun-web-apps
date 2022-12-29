import { Component, Inject, OnInit } from '@angular/core';
import {
  Attribute,
  AttributeDefinition,
  AttributesManagerService,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
import { FormControl } from '@angular/forms';

export interface ApplicationsListColumnsChangeDialogData {
  theme: string;
  voId: number;
  groupId?: number;
}
@Component({
  selector: 'app-applications-list-columns-change-dialog',
  templateUrl: './applications-list-columns-change-dialog.component.html',
  styleUrls: ['./applications-list-columns-change-dialog.component.scss'],
})
export class ApplicationsListColumnsChangeDialogComponent implements OnInit {
  loading = false;
  theme: string;
  simpleColumns = ['createdAt', 'type', 'state', 'createdBy', 'modifiedBy'];
  columnOptions = ['createdAt', 'type', 'state', 'createdBy', 'modifiedBy'];
  selectedColumns = new FormControl<string[]>([]);
  attribute: Attribute;

  constructor(
    private dialogRef: MatDialogRef<ApplicationsListColumnsChangeDialogComponent>,
    private attributesManager: AttributesManagerService,
    @Inject(MAT_DIALOG_DATA) private data: ApplicationsListColumnsChangeDialogData,
    private translate: PerunTranslateService,
    private notificator: NotificatorService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    if (this.data.groupId) {
      this.attributesManager
        .getIdpAttributeDefinitions()
        .subscribe((attrDefs: AttributeDefinition[]) => {
          attrDefs.forEach((attr) => {
            this.columnOptions.push(attr.friendlyName);
          });
          this.attributesManager
            .getGroupAttributeByName(
              this.data.groupId,
              'urn:perun:group:attribute-def:def:applicationViewPreferences'
            )
            .subscribe((attribute) => {
              this.attribute = attribute;
              const configuredColumns: string[] = attribute.value as string[];
              if (configuredColumns !== null && configuredColumns.length > 0) {
                this.selectedColumns.setValue(configuredColumns);
              } else {
                this.selectedColumns.setValue(this.simpleColumns);
              }
            });
        });
    } else {
      this.attributesManager
        .getIdpAttributeDefinitions()
        .subscribe((attrDefs: AttributeDefinition[]) => {
          attrDefs.forEach((attr) => {
            this.columnOptions.push(attr.friendlyName);
          });
          this.attributesManager
            .getVoAttributeByName(
              this.data.voId,
              'urn:perun:vo:attribute-def:def:applicationViewPreferences'
            )
            .subscribe((attribute) => {
              this.attribute = attribute;
              const configuredColumns: string[] = attribute.value as string[];
              if (configuredColumns !== null && configuredColumns.length > 0) {
                this.selectedColumns.setValue(configuredColumns);
              } else {
                this.selectedColumns.setValue(this.simpleColumns);
              }
            });
        });
    }
  }

  confirm(): void {
    if (this.data.groupId) {
      this.changeGroupAttribute();
    } else {
      this.changeVoAttribute();
    }
  }
  cancel(): void {
    this.dialogRef.close(false);
  }
  default(): void {
    this.attribute.value = [];
    this.confirm();
  }

  private changeVoAttribute(): void {
    this.loading = true;
    this.attributesManager
      .setVoAttribute({
        vo: this.data.voId,
        attribute: this.attribute,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.APPLICATIONS_LIST_COLUMNS_CHANGE.SUCCESS')
          );
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private changeGroupAttribute(): void {
    this.loading = true;
    this.attributesManager
      .setGroupAttribute({
        group: this.data.groupId,
        attribute: this.attribute,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
          this.notificator.showSuccess(
            this.translate.instant('DIALOGS.APPLICATIONS_LIST_COLUMNS_CHANGE.SUCCESS')
          );
        },
        error: () => {
          this.loading = false;
        },
      });
  }
}
