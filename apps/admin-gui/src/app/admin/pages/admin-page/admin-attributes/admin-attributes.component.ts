import { Component, HostBinding, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { DeleteAttributeDefinitionDialogComponent } from '../../../../shared/components/dialogs/delete-attribute-definition-dialog/delete-attribute-definition-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateAttributeDefinitionDialogComponent } from '../../../../shared/components/dialogs/create-attribute-definition-dialog/create-attribute-definition-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AttributeDefinition, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_ADMIN_ATTRIBUTES } from '@perun-web-apps/config/table-config';
import { AttributeImportDialogComponent } from '../../../../shared/components/dialogs/attribute-import-dialog/attribute-import-dialog.component';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-admin-attributes',
  templateUrl: './admin-attributes.component.html',
  styleUrls: ['./admin-attributes.component.scss'],
})
export class AdminAttributesComponent implements OnInit {
  @HostBinding('class.router-component') true;

  attrDefinitions: AttributeDefinition[] = [];

  selected = new SelectionModel<AttributeDefinition>(true, []);
  filterValue = '';

  loading: boolean;
  tableId = TABLE_ADMIN_ATTRIBUTES;

  constructor(
    private dialog: MatDialog,
    private attributesManager: AttributesManagerService,
    public authResolver: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.refreshTable();
  }

  onCreate(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';

    const dialogRef = this.dialog.open(CreateAttributeDefinitionDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onDelete(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      attributes: this.selected.selected,
      theme: 'admin-theme',
    };

    const dialogRef = this.dialog.open(DeleteAttributeDefinitionDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
        this.selected.clear();
      }
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.attributesManager.getAllAttributeDefinitions().subscribe((attrDefs) => {
      this.attrDefinitions = attrDefs;
      this.loading = false;
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  onImport(): void {
    const config = getDefaultDialogConfig();
    config.width = '700px';

    const dialogRef = this.dialog.open(AttributeImportDialogComponent, config);

    dialogRef.afterClosed().subscribe((value) => {
      if (value === true) {
        this.refreshTable();
      }
    });
  }
}
