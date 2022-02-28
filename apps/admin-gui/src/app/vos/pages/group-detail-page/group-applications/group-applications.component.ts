import { Component, HostBinding, OnInit } from '@angular/core';
import { AppState, Group, RegistrarManagerService } from '@perun-web-apps/perun/openapi';
import {
  TABLE_GROUP_APPLICATIONS_DETAILED,
  TABLE_GROUP_APPLICATIONS_NORMAL,
} from '@perun-web-apps/config/table-config';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-group-applications',
  templateUrl: './group-applications.component.html',
  styleUrls: ['./group-applications.component.scss'],
})
export class GroupApplicationsComponent implements OnInit {
  static id = 'GroupApplicationsComponent';

  // used for router animation
  @HostBinding('class.router-component') true;
  state = 'pending';
  currentStates: AppState[] = ['NEW', 'VERIFIED'];
  group: Group;
  displayedColumns: string[] = [
    'id',
    'createdAt',
    'type',
    'state',
    'createdBy',
    'groupName',
    'modifiedBy',
  ];
  detailedDisplayedColumns: string[] = [
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
  filterValue = '';
  showAllDetails = false;
  detailTableId = TABLE_GROUP_APPLICATIONS_DETAILED;
  tableId = TABLE_GROUP_APPLICATIONS_NORMAL;
  refresh = false;
  startDate: FormControl;
  endDate: FormControl;

  constructor(
    private registrarManager: RegistrarManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.group = this.entityStorageService.getEntity();
    this.startDate = new FormControl(formatDate(this.yearAgo(), 'yyyy-MM-dd', 'en-GB'));
    this.endDate = new FormControl(formatDate(new Date(), 'yyyy-MM-dd', 'en-GB'));
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

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
