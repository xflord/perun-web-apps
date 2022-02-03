import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { AttributeDefinition } from '@perun-web-apps/perun/openapi';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';

export interface DeleteAttributeDefinitionDialogData {
  attributes: AttributeDefinition[];
  theme: string;
}

@Component({
  selector: 'app-delete-attribute-definition-dialog',
  templateUrl: './delete-attribute-definition-dialog.component.html',
  styleUrls: ['./delete-attribute-definition-dialog.component.scss'],
})
export class DeleteAttributeDefinitionDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeleteAttributeDefinitionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteAttributeDefinitionDialogData,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private attributesManager: AttributesManagerService
  ) {}

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<AttributeDefinition>;
  loading = false;
  theme: string;

  ngOnInit() {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<AttributeDefinition>(this.data.attributes);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    const ids: number[] = [];
    for (const attr of this.data.attributes) {
      ids.push(attr.id);
    }

    this.attributesManager.deleteAttributeDefinitions(ids).subscribe(
      () => {
        this.translate
          .get('DIALOGS.DELETE_ATTRIBUTE_DEFINITION.SUCCESS')
          .subscribe((successMessage) => {
            this.notificator.showSuccess(successMessage);
            this.dialogRef.close(true);
          });
      },
      () => (this.loading = false)
    );
  }
}
