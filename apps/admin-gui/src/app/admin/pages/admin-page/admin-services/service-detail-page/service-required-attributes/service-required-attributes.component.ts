import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { AttributeDefinition, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import {
  TABLE_REQUIRED_ATTRIBUTES,
} from '@perun-web-apps/config/table-config';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddRequiredAttributesDialogComponent } from '../../../../../../shared/components/dialogs/add-required-attributes-dialog/add-required-attributes-dialog.component';
import { RemoveRequiredAttributesDialogComponent } from '../../../../../../shared/components/dialogs/remove-required-attributes-dialog/remove-required-attributes-dialog.component';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-service-required-attributes',
  templateUrl: './service-required-attributes.component.html',
  styleUrls: ['./service-required-attributes.component.scss']
})
export class ServiceRequiredAttributesComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private attributeManager: AttributesManagerService,
              private dialog: MatDialog,
              public authResolver: GuiAuthResolver
              ) { }

  loading = false;
  filterValue = '';

  serviceId: number;
  selection = new SelectionModel<AttributeDefinition>(true, []);
  attrDefinitions: AttributeDefinition[] = [];
  tableId = TABLE_REQUIRED_ATTRIBUTES;

  ngOnInit(): void {
    this.loading = true;
    this.route.parent.params.subscribe(params => {
      this.serviceId = params['serviceId'];
      this.refreshTable();
    });
  }

  refreshTable() {
    this.loading = true;
    this.attributeManager.getRequiredAttributesDefinition(this.serviceId).subscribe( attrDef => {
      this.selection.clear();
      this.attrDefinitions = attrDef;
      this.loading = false;
    });
  }

  onAdd() {
    const config = getDefaultDialogConfig();
    config.width = '950px';
    config.data = {
      serviceId: this.serviceId,
      theme: 'service-theme'
    };

    const dialogRef = this.dialog.open(AddRequiredAttributesDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onRemove() {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = {
      serviceId: this.serviceId,
      attrDefinitions: this.selection.selected,
      theme: 'service-theme'
    };

    const dialogRef = this.dialog.open(RemoveRequiredAttributesDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

}
