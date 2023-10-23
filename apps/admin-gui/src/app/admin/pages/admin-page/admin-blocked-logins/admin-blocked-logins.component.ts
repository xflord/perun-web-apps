import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BlockedLogin } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { TABLE_ADMIN_BLOCKED_LOGINS } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { UnblockLoginsDialogComponent } from '../../../../shared/components/dialogs/unblock-logins-dialog/unblock-logins-dialog.component';
import { BlockLoginsDialogComponent } from '../../../../shared/components/dialogs/block-logins-dialog/block-logins-dialog.component';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { FormControl } from '@angular/forms';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-perun-web-apps-admin-blocked-logins',
  templateUrl: './admin-blocked-logins.component.html',
  styleUrls: ['./admin-blocked-logins.component.scss'],
})
export class AdminBlockedLoginsComponent implements OnInit {
  loading$: Observable<boolean>;
  update = false;
  tableId = TABLE_ADMIN_BLOCKED_LOGINS;
  isAdmin = false;

  searchString: string;
  selection = new SelectionModel<BlockedLogin>(true, []);

  logins: BlockedLogin[] = [];

  namespaceOptions: string[] = [];
  filterOptions: string[] = [];
  selectedNamespaces: string[] = [];
  namespaces = new FormControl();

  constructor(
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private attributesService: AttributesManagerService,
    public authResolver: GuiAuthResolver,
  ) {}

  refreshTable(): void {
    this.update = !this.update;
    this.cd.detectChanges();
  }

  onSearchByString(searchString: string): void {
    this.searchString = searchString;
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.loading$ = of(true);
    this.namespaces.setValue(this.selectedNamespaces);
    this.isAdmin = this.authResolver.isPerunAdmin();

    this.attributesService.getAllNamespaces().subscribe((res) => {
      this.namespaceOptions = res;
      this.filterOptions = [''].concat(res);
    });
  }

  block(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      theme: 'admin-theme',
      namespaceOptions: this.namespaceOptions,
    };

    const dialogRef = this.dialog.open(BlockLoginsDialogComponent, config);

    dialogRef.afterClosed().subscribe((wereLoginsBlocked) => {
      if (wereLoginsBlocked) {
        this.update = !this.update;
        this.selection.clear();
        this.cd.detectChanges();
      }
    });
  }

  unblock(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = {
      logins: this.selection.selected,
      theme: 'admin-theme',
    };

    const dialogRef = this.dialog.open(UnblockLoginsDialogComponent, config);

    dialogRef.afterClosed().subscribe((wereLoginsUnblocked) => {
      if (wereLoginsUnblocked) {
        this.update = !this.update;
        this.selection.clear();
        this.cd.detectChanges();
      }
    });
  }

  toggleEvent(namespaces: string[]): void {
    // Replace array in-place so it won't trigger ngOnChanges
    this.selectedNamespaces.splice(
      0,
      this.selectedNamespaces.length,
      ...namespaces.map((namespace) => (namespace === '' ? null : namespace)),
    );
  }

  refreshOnClosed(): void {
    this.selectedNamespaces = [...this.selectedNamespaces];
    this.cd.detectChanges();
  }
}
