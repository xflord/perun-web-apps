import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute,  Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TABLE_USER_SERVICE_IDENTITIES, TableConfigService } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ConnectIdentityDialogComponent } from '../../../../../shared/components/dialogs/connect-identity-dialog/connect-identity-dialog.component';
import { DisconnectIdentityDialogComponent } from '../../../../../shared/components/dialogs/disconnect-identity-dialog/disconnect-identity-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-user-settings-service-identities',
  templateUrl: './user-settings-service-identities.component.html',
  styleUrls: ['./user-settings-service-identities.component.scss']
})
export class UserSettingsServiceIdentitiesComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private dialog: MatDialog,
              private router: Router,
              private tableConfigService: TableConfigService,
              private userManager: UsersManagerService,
              public authResolver: GuiAuthResolver
              ) { }

  loading = false;
  selection = new SelectionModel<User>(false, []);
  identities: User[] = [];
  pageSize: number;
  userId: number;
  tableId = TABLE_USER_SERVICE_IDENTITIES;
  displayedColumns = [ 'select', 'id', 'user', 'name' ];

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.loading = true;

    this.route.parent.parent.params
        .subscribe(params => {
      this.userId = params["userId"];
      this.userManager.getSpecificUsersByUser(this.userId).subscribe(identities => {
        this.identities = identities;
        this.loading = false;
      });
    });
  }

  refreshTable(){
    this.loading = true;
    this.userManager.getSpecificUsersByUser(this.userId).subscribe(identities => {
      this.identities = identities;
      this.selection.clear();
      this.loading = false;
    });
  }

  onAdd(){
    const config = getDefaultDialogConfig();
    config.width = "1250px";
    config.data = {
      userId : this.userId,
      theme: "user-theme",
      isService: false
    };

    const dialogRef = this.dialog.open(ConnectIdentityDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onRemove(){
    const config = getDefaultDialogConfig();
    config.width = "650px";
    config.data = {
      identities: this.selection.selected,
      userId: this.userId,
      specificUser: this.selection.selected[0],
      theme: "user-theme"
    };

    const dialogRef = this.dialog.open(DisconnectIdentityDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

}
