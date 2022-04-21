import { Component, OnInit } from '@angular/core';
import { CabinetManagerService, Category } from '@perun-web-apps/perun/openapi';
import { TABLE_GROUP_RESOURCES_LIST } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddCategoryDialogComponent } from '../../dialogs/add-category-dialog/add-category-dialog.component';
import { RemoveCategoryDialogComponent } from '../../dialogs/remove-category-dialog/remove-category-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss'],
})
export class CategoriesPageComponent implements OnInit {
  categories: Category[] = [];
  selected = new SelectionModel<Category>(true, []);
  loading: boolean;
  filterValue = '';
  tableId = TABLE_GROUP_RESOURCES_LIST;

  removeAuth: boolean;
  addAuth: boolean;

  constructor(
    private cabinetManagerService: CabinetManagerService,
    private dialog: MatDialog,
    private guiAuthResolver: GuiAuthResolver
  ) {}

  ngOnInit(): void {
    this.setAuth();
    this.refreshTable();
  }

  setAuth(): void {
    this.removeAuth = this.guiAuthResolver.isAuthorized('deleteCategory_Category_policy', []);
    this.addAuth = this.guiAuthResolver.isAuthorized('createCategory_Category_policy', []);
  }

  refreshTable(): void {
    this.loading = true;
    this.cabinetManagerService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.loading = false;
    });
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  addCategory(): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {};

    const dialogRef = this.dialog.open(AddCategoryDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  removeCategory(): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = this.selected.selected;

    const dialogRef = this.dialog.open(RemoveCategoryDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selected.clear();
        this.refreshTable();
      }
    });
  }
}
