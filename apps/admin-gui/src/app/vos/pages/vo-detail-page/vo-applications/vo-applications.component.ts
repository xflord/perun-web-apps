import { Component, HostBinding, OnInit } from '@angular/core';
import { AppState, RegistrarManagerService, Vo } from '@perun-web-apps/perun/openapi';
import {
  TABLE_VO_APPLICATIONS_DETAILED,
  TABLE_VO_APPLICATIONS_NORMAL,
} from '@perun-web-apps/config/table-config';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { EntityStorageService } from '@perun-web-apps/perun/services';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
  simpleColumns: string[] = [
    'id',
    'createdAt',
    'type',
    'state',
    'createdBy',
    'groupName',
    'modifiedBy',
  ];
  detailedColumns: string[] = [
    'id',
    'createdAt',
    'voId',
    'voName',
    'groupId',
    'groupName',
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
  currentColumns: string[] = [];
  filterValue = '';
  showAllDetails = false;
  detailTableId = TABLE_VO_APPLICATIONS_DETAILED;
  tableId = TABLE_VO_APPLICATIONS_NORMAL;
  startDate: FormControl;
  endDate: FormControl;
  showGroupApps = false;
  refresh = false;

  constructor(
    private registrarManager: RegistrarManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.vo = this.entityStorageService.getEntity();
    this.startDate = new FormControl(formatDate(this.yearAgo(), 'yyyy-MM-dd', 'en-GB'));
    this.endDate = new FormControl(formatDate(new Date(), 'yyyy-MM-dd', 'en-GB'));
    this.currentColumns = this.refreshColumns();
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
    this.showAllDetails = value;
    this.currentColumns = this.refreshColumns();
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  refreshColumns(): string[] {
    if (this.showAllDetails) {
      return this.showGroupApps
        ? this.detailedColumns
        : this.detailedColumns.filter((c) => c !== 'groupName' && c !== 'groupId');
    }
    return this.showGroupApps
      ? this.simpleColumns
      : this.simpleColumns.filter((c) => c !== 'groupName');
  }
}
