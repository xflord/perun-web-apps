import { Component, OnInit, ViewChild } from '@angular/core';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { EditAttributeDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';
import { AttributesListComponent } from '@perun-web-apps/perun/components';

@Component({
  selector: 'app-service-identity-certificates',
  templateUrl: './service-identity-certificates.component.html',
  styleUrls: ['./service-identity-certificates.component.scss'],
})
export class ServiceIdentityCertificatesComponent implements OnInit {
  @ViewChild('list') list: AttributesListComponent;
  loading: boolean;
  userId: number;
  certificates: Attribute;
  selection: SelectionModel<Attribute> = new SelectionModel<Attribute>(true, []);

  constructor(
    private entityStorageService: EntityStorageService,
    private attributesManagerService: AttributesManagerService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.userId = this.entityStorageService.getEntity().id;
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.attributesManagerService
      .getUserAttributeByName(this.userId, Urns.USER_DEF_CERTIFICATES)
      .subscribe((certificates) => {
        this.certificates = certificates;
        this.selection.clear();
        this.loading = false;
      });
  }

  save(): void {
    this.list.updateMapAttributes();

    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.userId,
      entity: 'user',
      attributes: this.selection.selected,
    };

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh();
      }
    });
  }
}
