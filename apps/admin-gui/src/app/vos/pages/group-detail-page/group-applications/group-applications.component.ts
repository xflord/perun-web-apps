import { ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import {
  AppState,
  AttributeDefinition,
  AttributesManagerService,
  Group,
  RegistrarManagerService,
} from '@perun-web-apps/perun/openapi';
import {
  TABLE_GROUP_APPLICATIONS_DETAILED,
  TABLE_GROUP_APPLICATIONS_NORMAL,
} from '@perun-web-apps/config/table-config';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { UntypedFormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ApplicationsListColumnsChangeDialogComponent } from '../../../../shared/components/dialogs/applications-list-columns-change-dialog/applications-list-columns-change-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-group-applications',
  templateUrl: './group-applications.component.html',
  styleUrls: ['./group-applications.component.scss'],
})
export class GroupApplicationsComponent implements OnInit {
  static id = 'GroupApplicationsComponent';

  // used for router animation
  @HostBinding('class.router-component') true;
  currentStates: AppState[] = ['NEW', 'VERIFIED'];
  group: Group;

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
  filterValue = '';
  showAllDetails = false;
  detailTableId = TABLE_GROUP_APPLICATIONS_DETAILED;
  tableId = TABLE_GROUP_APPLICATIONS_NORMAL;
  refresh = false;
  startDate: UntypedFormControl;
  endDate: UntypedFormControl;
  fedAttrNames: string[] = [];
  currentColumns: string[] = [];
  configuredColumns: string[] = [];
  configuredFedColumns: string[] = [];
  columnsAuth = false;
  loading$: Observable<boolean>;

  constructor(
    private registrarManager: RegistrarManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService,
    private attributeManager: AttributesManagerService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading$ = of(true);
    this.group = this.entityStorageService.getEntity();
    this.startDate = new UntypedFormControl(formatDate(this.yearAgo(), 'yyyy-MM-dd', 'en-GB'));
    this.endDate = new UntypedFormControl(formatDate(new Date(), 'yyyy-MM-dd', 'en-GB'));
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

  yearAgo(): Date {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - 365);
    return newDate;
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  showDetails(value: boolean): void {
    this.showAllDetails = value;
    this.loadViewConfiguration();
  }
  refreshColumns(): string[] {
    this.cd.detectChanges();
    if (this.showAllDetails) {
      return ['id'].concat(this.detailedColumns);
    }
    if (this.configuredColumns.length > 0) {
      return ['id'].concat(this.configuredColumns);
    }
    return ['id'].concat(this.simpleColumns);
  }

  loadViewConfiguration(): void {
    this.cd.detectChanges();
    this.attributeManager
      .getGroupAttributeByName(
        this.group.id,
        'urn:perun:group:attribute-def:def:applicationViewPreferences'
      )
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
      });
  }

  setColumns(): void {
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = { columns: [], groupId: this.group.id, theme: 'group-theme' };

    const dialogRef = this.dialog.open(ApplicationsListColumnsChangeDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadViewConfiguration();
      }
    });
  }

  refreshTable(): void {
    this.refresh = !this.refresh;
    this.cd.detectChanges();
  }
}
