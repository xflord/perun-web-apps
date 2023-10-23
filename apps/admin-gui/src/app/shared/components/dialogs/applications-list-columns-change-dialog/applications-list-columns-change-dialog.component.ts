import { Component, Inject, OnInit } from '@angular/core';
import {
  Attribute,
  AttributeDefinition,
  AttributesManagerService,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
import { ApplicationColumnSelectLabelPipe } from '@perun-web-apps/perun/pipes';
import { containsExactlyInAnyOrder } from '@perun-web-apps/perun/utils';

export interface ApplicationsListColumnsChangeDialogData {
  theme: string;
  voId: number;
  groupId?: number;
}
@Component({
  selector: 'app-applications-list-columns-change-dialog',
  templateUrl: './applications-list-columns-change-dialog.component.html',
  styleUrls: ['./applications-list-columns-change-dialog.component.scss'],
  providers: [ApplicationColumnSelectLabelPipe],
})
export class ApplicationsListColumnsChangeDialogComponent implements OnInit {
  loading = false;
  theme: string;
  simpleColumns = ['createdAt', 'type', 'state', 'createdBy', 'modifiedBy'];
  columnOptions = ['createdAt', 'type', 'state', 'createdBy', 'modifiedBy'];
  selectedColumns: string[] = [];
  attribute: Attribute;
  templateAttribute: Attribute;
  fedAttributeDefs: AttributeDefinition[] = [];

  constructor(
    private dialogRef: MatDialogRef<ApplicationsListColumnsChangeDialogComponent>,
    private attributesManager: AttributesManagerService,
    @Inject(MAT_DIALOG_DATA) private data: ApplicationsListColumnsChangeDialogData,
    private translate: PerunTranslateService,
    private notificator: NotificatorService,
    public columnNamePipe: ApplicationColumnSelectLabelPipe,
  ) {}

  columnTranslation = (name: string): string =>
    this.columnNamePipe.transform(this.friendlyToDisplayAttrName(name));

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.loading = true;
    if (this.data.groupId) {
      this.attributesManager
        .getIdpAttributeDefinitions()
        .subscribe((attrDefs: AttributeDefinition[]) => {
          this.processFedAttributes(attrDefs);
          this.attributesManager
            .getVoAttributeByName(
              this.data.voId,
              'urn:perun:vo:attribute-def:def:applicationViewPreferences',
            )
            .subscribe((voAttr) => {
              if (voAttr.value !== null) {
                this.templateAttribute = voAttr;
              }
              this.attributesManager
                .getGroupAttributeByName(
                  this.data.groupId,
                  'urn:perun:group:attribute-def:def:applicationViewPreferences',
                )
                .subscribe((groupAttr) => {
                  this.processCurrentSettings(groupAttr);
                  this.loading = false;
                });
            });
        });
    } else {
      this.attributesManager
        .getIdpAttributeDefinitions()
        .subscribe((attrDefs: AttributeDefinition[]) => {
          this.processFedAttributes(attrDefs);
          this.attributesManager
            .getVoAttributeByName(
              this.data.voId,
              'urn:perun:vo:attribute-def:def:applicationViewPreferences',
            )
            .subscribe((attribute) => {
              this.processCurrentSettings(attribute);
            });
          this.loading = false;
        });
    }
  }

  confirm(): void {
    if (
      this.selectedColumns === null ||
      this.selectedColumns.length === 0 ||
      containsExactlyInAnyOrder(this.selectedColumns, this.simpleColumns)
    ) {
      this.attribute.value = [];
    } else {
      this.attribute.value = [...this.selectedColumns];
    }
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
    this.selectedColumns = [...this.simpleColumns];
  }

  template(): void {
    this.selectedColumns = this.templateAttribute.value as string[];
  }

  private friendlyToDisplayAttrName(column: string): string {
    return (
      this.fedAttributeDefs.find((attr) => attr.friendlyName === column)?.displayName || column
    );
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
            this.translate.instant('DIALOGS.APPLICATIONS_LIST_COLUMNS_CHANGE.SUCCESS'),
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
            this.translate.instant('DIALOGS.APPLICATIONS_LIST_COLUMNS_CHANGE.SUCCESS'),
          );
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private processFedAttributes(attrDefs: AttributeDefinition[]): void {
    attrDefs = attrDefs.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));
    this.fedAttributeDefs = attrDefs;
    attrDefs.forEach((attr) => {
      this.columnOptions.push(attr.friendlyName);
    });
    this.columnOptions = [...this.columnOptions];
  }

  private processCurrentSettings(attr: Attribute): void {
    this.attribute = attr;
    const configuredColumns: string[] = attr.value as string[];
    if (configuredColumns !== null && configuredColumns.length > 0) {
      this.selectedColumns = [...configuredColumns];
    } else {
      this.selectedColumns = [...this.simpleColumns];
    }
  }
}
