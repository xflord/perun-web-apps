import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
  Attribute,
  AttributesManagerService,
  FacilitiesManagerService,
  Host,
} from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { TABLE_ATTRIBUTES_SETTINGS } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { filterCoreAttributes, getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AttributesListComponent } from '@perun-web-apps/perun/components';
import { DeleteAttributeDialogComponent } from '../../../../../shared/components/dialogs/delete-attribute-dialog/delete-attribute-dialog.component';
import { EditAttributeDialogComponent } from '@perun-web-apps/perun/dialogs';
import { CreateAttributeDialogComponent } from '../../../../../shared/components/dialogs/create-attribute-dialog/create-attribute-dialog.component';

@Component({
  selector: 'app-facility-hosts-detail',
  templateUrl: './facility-hosts-detail.component.html',
  styleUrls: ['./facility-hosts-detail.component.scss'],
})
export class FacilityHostsDetailComponent implements OnInit {
  @ViewChild('list')
  list: AttributesListComponent;

  attributes: Attribute[] = [];
  selected = new SelectionModel<Attribute>(true, []);
  hostId: number;
  host: Host = { beanName: '', id: 0 };
  loading: boolean;
  tableId = TABLE_ATTRIBUTES_SETTINGS;

  constructor(
    private dialog: MatDialog,
    private attributesManager: AttributesManagerService,
    private facilityManager: FacilitiesManagerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.hostId = Number(params['hostId']);
      this.facilityManager.getHostById(this.hostId).subscribe((host) => {
        this.host = host;
      });
      this.refreshTable();
    });
  }

  refreshTable(): void {
    this.loading = true;
    this.attributesManager.getHostAttributes(this.hostId).subscribe((attributes) => {
      this.attributes = filterCoreAttributes(attributes);
      this.selected.clear();
      this.loading = false;
    });
  }

  onSave(): void {
    this.list.updateMapAttributes();

    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.hostId,
      entity: 'host',
      attributes: this.selected.selected,
    };

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  addAttribute(): void {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.hostId,
      entity: 'host',
      notEmptyAttributes: this.attributes,
      style: 'facility-theme',
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'saved') {
        this.refreshTable();
      }
    });
  }

  removeAttribute(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.hostId,
      entity: 'host',
      attributes: this.selected.selected,
      theme: 'facility-theme',
    };

    const dialogRef = this.dialog.open(DeleteAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }
}
