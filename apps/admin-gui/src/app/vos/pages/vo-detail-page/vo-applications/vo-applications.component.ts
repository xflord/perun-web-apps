import { Component, HostBinding, OnInit } from '@angular/core';
import { Application, RegistrarManagerService, Vo } from '@perun-web-apps/perun/openapi';
import {
  TABLE_VO_APPLICATIONS_DETAILED,
  TABLE_VO_APPLICATIONS_NORMAL,
} from '@perun-web-apps/config/table-config';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { EntityStorageService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-applications',
  templateUrl: './vo-applications.component.html',
  styleUrls: ['./vo-applications.component.scss'],
})
export class VoApplicationsComponent implements OnInit {
  static id = 'VoApplicationsComponent';

  @HostBinding('class.router-component') true;

  constructor(
    private registrarManager: RegistrarManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  state = 'pending';
  loading = false;
  applications: Application[] = [];
  vo: Vo;
  displayedColumns: string[] = ['id', 'createdAt', 'type', 'state', 'user', 'group', 'modifiedBy'];
  firstSearchDone: boolean;
  filterValue = '';
  showAllDetails = false;
  detailTableId = TABLE_VO_APPLICATIONS_DETAILED;
  tableId = TABLE_VO_APPLICATIONS_NORMAL;

  startDate: FormControl;
  endDate: FormControl;
  checked = false;

  ngOnInit() {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();
    this.startDate = new FormControl(formatDate(this.yearAgo(), 'yyyy-MM-dd', 'en-GB'));
    this.endDate = new FormControl(formatDate(new Date(), 'yyyy-MM-dd', 'en-GB'));
    this.setData(['NEW', 'VERIFIED']);
  }

  setData(state: string[]) {
    this.registrarManager
      .getApplicationsForVo(
        this.vo.id,
        state,
        formatDate(this.startDate.value, 'yyyy-MM-dd', 'en-GB'),
        formatDate(this.endDate.value, 'yyyy-MM-dd', 'en-GB')
      )
      .subscribe((applications) => {
        if (this.checked === false) {
          this.applications = applications.filter((application) => application.group === null);
        } else {
          this.applications = applications;
        }
        this.loading = false;
      });
  }

  select() {
    this.loading = true;
    switch (this.state) {
      case 'approved': {
        this.setData(['APPROVED']);
        break;
      }
      case 'rejected': {
        this.setData(['REJECTED']);
        break;
      }
      case 'wfmv': {
        this.setData(['NEW']);
        break;
      }
      case 'submited': {
        this.setData(['VERIFIED']);
        break;
      }
      case 'pending': {
        this.setData(['NEW', 'VERIFIED']);
        break;
      }
      case 'all': {
        this.setData(null);
        break;
      }
      default: {
        break;
      }
    }
  }

  yearAgo() {
    const date = new Date();
    const year = date.getFullYear() - 1;
    const month = date.getMonth();
    const day = date.getDate();
    return new Date(year, month, day);
  }

  showGroupApplications(event) {
    this.checked = event.checked;
    this.select();
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }
}
