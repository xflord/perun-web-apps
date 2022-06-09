import { AfterViewChecked, Component, HostBinding, OnInit } from '@angular/core';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { EnrichedVo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, getRecentlyVisitedIds } from '@perun-web-apps/perun/utils';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { RemoveVoDialogComponent } from '../../../shared/components/dialogs/remove-vo-dialog/remove-vo-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { CreateVoDialogComponent } from '../../../shared/components/dialogs/create-vo-dialog/create-vo-dialog.component';
import { TABLE_VO_SELECT } from '@perun-web-apps/config/table-config';
import { HttpErrorResponse } from '@angular/common/http';
import { RPCError } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-vo-select-page',
  templateUrl: './vo-select-page.component.html',
  styleUrls: ['./vo-select-page.component.scss'],
})
export class VoSelectPageComponent implements OnInit, AfterViewChecked {
  static id = 'VoSelectPageComponent';
  @HostBinding('class.router-component') true;
  vos: EnrichedVo[] = [];
  recentIds: number[] = [];
  loading: boolean;
  filterValue = '';

  createAuth: boolean;
  deleteAuth: boolean;

  selection: SelectionModel<EnrichedVo>;

  displayedColumns: string[];
  tableId = TABLE_VO_SELECT;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private apiRequest: ApiRequestConfigurationService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.selection = new SelectionModel<EnrichedVo>(false, []);
    this.createAuth = this.guiAuthResolver.isAuthorized('createVo_Vo_policy', []);
    this.deleteAuth = this.guiAuthResolver.isAuthorized('deleteVo_Vo_policy', []);
    this.displayedColumns = this.deleteAuth
      ? ['checkbox', 'id', 'hierarchy', 'recent', 'shortName', 'name']
      : ['id', 'recent', 'hierarchy', 'shortName', 'name'];
    this.refreshTable();
  }

  ngAfterViewChecked(): void {
    this.sideMenuService.setAccessMenuItems([]);
  }

  refreshTable(): void {
    this.loading = true;
    this.selection.clear();
    this.apiRequest.dontHandleErrorForNext();
    this.voService.getMyEnrichedVos().subscribe(
      (vos) => {
        this.vos = vos;
        this.recentIds = getRecentlyVisitedIds('vos');
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        const e = error.error as RPCError;
        if (e.name === 'PrivilegeException') {
          this.vos = [];
          this.loading = false;
        } else {
          this.notificator.showRPCError(e);
        }
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  onCreateVo(): void {
    const config = getDefaultDialogConfig();
    config.width = '610px';
    config.data = { theme: 'vo-theme' };

    const dialogRef = this.dialog.open(CreateVoDialogComponent, config);

    dialogRef.afterClosed().subscribe((isVoCreated) => {
      if (isVoCreated) {
        this.loading = true;
        this.refreshTable();
      }
    });
  }

  onRemoveVo(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      theme: 'vo-theme',
      vos: [this.selection.selected[0].vo],
    };
    const dialogRef = this.dialog.open(RemoveVoDialogComponent, config);

    dialogRef.afterClosed().subscribe((isVoRemoved) => {
      if (isVoRemoved) {
        this.refreshTable();
      }
    });
  }
}
