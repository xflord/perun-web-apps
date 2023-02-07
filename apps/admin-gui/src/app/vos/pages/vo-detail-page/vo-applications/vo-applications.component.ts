import { Component, HostBinding, OnInit } from '@angular/core';
import {
  AppState,
  AttributeDefinition,
  AttributesManagerService,
  RegistrarManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import {
  TABLE_VO_APPLICATIONS_DETAILED,
  TABLE_VO_APPLICATIONS_NORMAL,
} from '@perun-web-apps/config/table-config';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { EntityStorageService } from '@perun-web-apps/perun/services';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ApplicationsListColumnsChangeDialogComponent } from '../../../../shared/components/dialogs/applications-list-columns-change-dialog/applications-list-columns-change-dialog.component';

@Component({
  selector: 'app-vo-applications',
  templateUrl: './vo-applications.component.html',
  styleUrls: ['./vo-applications.component.scss'],
})
export class VoApplicationsComponent implements OnInit {
  static id = 'VoApplicationsComponent';

  @HostBinding('class.router-component') true;
  state = 'pending';
  currentStates: AppState[] = ['NEW', 'VERIFIED'];
  vo: Vo;
  simplePrependColumns = ['id'];
  groupPrependColumns = ['id', 'groupId', 'groupName'];
  simpleColumns: string[] = ['createdAt', 'type', 'state', 'createdBy', 'modifiedBy'];
  detailedColumns: string[] = [
    'createdAt',
    'type',
    'state',
    'extSourceName',
    'extSourceType',
    'user',
    'createdBy',
    'modifiedBy',
    'modifiedAt',
    'fedInfo',
  ];
  configuredColumns: string[] = [];
  configuredFedColumns: string[] = [];
  currentColumns: string[] = [];
  columnsAuth = false;
  filterValue = '';
  showAllDetails = false;
  detailTableId = TABLE_VO_APPLICATIONS_DETAILED;
  tableId = TABLE_VO_APPLICATIONS_NORMAL;
  startDate: FormControl<Date | string>;
  endDate: FormControl<Date | string>;
  showGroupApps = false;
  refresh = false;
  loading = true;
  fedAttrNames: string[] = [];

  constructor(
    private registrarManager: RegistrarManagerService,
    private entityStorageService: EntityStorageService,
    private attributeManager: AttributesManagerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.startDate = new FormControl<Date | string>(
      formatDate(this.yearAgo(), 'yyyy-MM-dd', 'en-GB')
    );
    this.endDate = new FormControl<Date | string>(formatDate(new Date(), 'yyyy-MM-dd', 'en-GB'));
    this.attributeManager
      .getIdpAttributeDefinitions()
      .subscribe((attrDefs: AttributeDefinition[]) => {
        attrDefs.forEach((attr) => {
          if (!this.fedAttrNames.includes(attr.friendlyName)) {
            this.fedAttrNames.push(attr.friendlyName);
          }
        });
      });
    this.loadViewConfiguration();
  }

  select(): void {
    switch (this.state) {
      case 'approved': {
        this.currentStates = ['APPROVED'];
        break;
      }
      case 'rejected': {
        this.currentStates = ['REJECTED'];
        break;
      }
      case 'wfmv': {
        this.currentStates = ['NEW'];
        break;
      }
      case 'submited': {
        this.currentStates = ['VERIFIED'];
        break;
      }
      case 'pending': {
        this.currentStates = ['NEW', 'VERIFIED'];
        break;
      }
      case 'all': {
        this.currentStates = null;
        break;
      }
      default: {
        break;
      }
    }
  }

  yearAgo(): Date {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - 365);
    return newDate;
  }

  showGroupApplications(event: MatCheckboxChange): void {
    this.showGroupApps = event.checked;
    this.currentColumns = this.refreshColumns();
  }

  showDetails(value: boolean): void {
    this.loading = true;
    this.showAllDetails = value;
    this.loadViewConfiguration();
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  refreshColumns(): string[] {
    if (this.showAllDetails) {
      return this.showGroupApps
        ? this.groupPrependColumns.concat(this.detailedColumns)
        : this.simplePrependColumns.concat(this.detailedColumns);
    }
    if (this.configuredColumns.length > 0) {
      return this.showGroupApps
        ? this.groupPrependColumns.concat(this.configuredColumns)
        : this.simplePrependColumns.concat(this.configuredColumns);
    }
    return this.showGroupApps
      ? this.groupPrependColumns.concat(this.simpleColumns)
      : this.simplePrependColumns.concat(this.simpleColumns);
  }

  loadViewConfiguration(): void {
    this.attributeManager
      .getVoAttributeByName(this.vo.id, 'urn:perun:vo:attribute-def:def:applicationViewPreferences')
      .subscribe((attribute) => {
        if (
          attribute?.value !== undefined &&
          attribute?.value !== null &&
          (attribute?.value as Array<string>).length > 0
        ) {
          this.configuredColumns = attribute.value as Array<string>;
          this.configuredFedColumns = this.configuredColumns.filter((column) =>
            this.fedAttrNames.includes(column)
          );
        } else {
          this.configuredColumns = [];
          this.configuredFedColumns = [];
        }
        this.columnsAuth = attribute.writable;
        this.currentColumns = this.refreshColumns();
        this.loading = false;
      });
  }

  setColumns(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = { columns: [], voId: this.vo.id, theme: 'vo-theme' };

    const dialogRef = this.dialog.open(ApplicationsListColumnsChangeDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadViewConfiguration();
      }
    });
  }
}
