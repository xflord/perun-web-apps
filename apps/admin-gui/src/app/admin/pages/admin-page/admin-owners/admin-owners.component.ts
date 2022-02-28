import { Component, OnInit } from '@angular/core';
import { Owner, OwnersManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_GROUP_RESOURCES_LIST } from '@perun-web-apps/config/table-config';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { DeleteOwnerDialogComponent } from '../../../../shared/components/delete-owner-dialog/delete-owner-dialog.component';
import { AddOwnerDialogComponent } from '../../../../shared/components/add-owner-dialog/add-owner-dialog.component';

@Component({
  selector: 'app-admin-owners',
  templateUrl: './admin-owners.component.html',
  styleUrls: ['./admin-owners.component.scss'],
})
export class AdminOwnersComponent implements OnInit {
  owners: Owner[] = [];
  selected = new SelectionModel<Owner>(true, []);
  loading: boolean;
  filterValue = '';
  tableId = TABLE_GROUP_RESOURCES_LIST;

  removeAuth: boolean;
  addAuth: boolean;

  constructor(
    private ownersManagerService: OwnersManagerService,
    private dialog: MatDialog,
    private guiAuthResolver: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.setAuth();
    this.refreshTable();
  }

  setAuth(): void {
    this.removeAuth = this.guiAuthResolver.isAuthorized('deleteOwner_Owner_policy', []);
    this.addAuth = this.guiAuthResolver.isAuthorized('createOwner_Owner_policy', []);
  }

  refreshTable(): void {
    this.loading = true;
    this.ownersManagerService.getAllOwners().subscribe((owners) => {
      this.owners = owners;
      this.selected.clear();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  addOwner(): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {};

    const dialogRef = this.dialog.open(AddOwnerDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  removeOwner(): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = this.selected.selected;

    const dialogRef = this.dialog.open(DeleteOwnerDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selected.clear();
        this.refreshTable();
      }
    });
  }
}
