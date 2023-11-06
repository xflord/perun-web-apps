import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Application,
  AppState,
  Attribute,
  AttributeDefinition,
  AttributesManagerService,
  Group,
  MailType,
  RegistrarManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { FormControl } from '@angular/forms';
import { NotificatorService, PerunTranslateService } from '@perun-web-apps/perun/services';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApplicationsBulkOperationDialogComponent } from '../dialogs/applications-bulk-operation-dialog/applications-bulk-operation-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { NotificationData, RPCError } from '@perun-web-apps/perun/models';
import { NotificationDialogComponent } from '@perun-web-apps/perun/dialogs';

export interface AppAction {
  approve: boolean;
  reject: boolean;
  delete: boolean;
  resend: boolean;
  columnSettings?: boolean;
}

interface AppActionTooltip {
  approve: string;
  reject: string;
  delete: string;
  resend: string;
  columnSettings?: string;
}

@Component({
  selector: 'app-application-actions',
  templateUrl: './application-actions.component.html',
  styleUrls: ['./application-actions.component.scss'],
})
export class ApplicationActionsComponent implements OnInit {
  @Input() theme: string;
  @Input() vo: Vo;
  @Input() group: Group;
  @Input() authRights: AppAction;
  @Input() tableId: string;
  @Input() detailTableId: string;
  @Input() fedAttrs: AttributeDefinition[];
  @Output() changeView = new EventEmitter<void>();

  loading$: Observable<boolean>;
  refresh = false;

  tooltipMessages: AppActionTooltip = {
    approve: '',
    reject: '',
    delete: '',
    resend: '',
    columnSettings: '',
  };
  canPerformAction: AppAction = {
    approve: false,
    reject: false,
    delete: false,
    resend: false,
  };

  currentStates: AppState[] = ['NEW', 'VERIFIED'];

  filterValue = '';

  startDate: FormControl<Date> = new FormControl<Date>(this.yearAgo());
  endDate: FormControl<Date> = new FormControl<Date>(new Date());

  showAllDetails = false;
  showGroupApps = false;

  prependColumns = ['checkbox', 'id'];
  groupPrependColumns = ['groupId', 'groupName'];
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

  currentColumns: string[] = [];
  configuredColumns: string[] = [];
  configuredFedColumns: string[] = [];

  selectedApplications: Application[] = [];

  constructor(
    private attributeService: AttributesManagerService,
    private registrarService: RegistrarManagerService,
    private notificator: NotificatorService,
    private translate: PerunTranslateService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
  ) {}

  @Input() set viewPreferences(att: Attribute) {
    this.loading$ = of(true);
    if ((att?.value as Array<string>)?.length > 0) {
      this.configuredColumns = att.value as Array<string>;
      this.configuredFedColumns = this.configuredColumns.filter((column) =>
        this.fedAttrs.some((attr) => attr.friendlyName === column),
      );
    } else {
      this.configuredColumns = [];
      this.configuredFedColumns = [];
    }
    this.authRights.columnSettings = att?.writable;
    this.currentColumns = this.setColumns();
  }

  ngOnInit(): void {
    this.loading$ = of(true);
    this.showGroupApps = !!this.group;
    this.onSelectedApplicationsChange([]);
  }

  refreshTable(): void {
    this.refresh = !this.refresh;
    this.cd.detectChanges();
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
    this.cd.detectChanges();
  }

  onApprove(): void {
    const dialogRef = this.openDialog(
      'VO_DETAIL.APPLICATION.DIALOG.APPROVE.TITLE',
      'VO_DETAIL.APPLICATION.DIALOG.APPROVE.DESCRIPTION',
      'VO_DETAIL.APPLICATION.APPLICATION_DETAIL.APPROVE',
      'APPROVE',
      this.selectedApplications,
      this.currentColumns,
    );
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.registrarService
          .approveApplications(this.selectedApplications.map((app) => app.id))
          .subscribe({
            next: () => {
              this.notificator.showInstantSuccess('VO_DETAIL.APPLICATION.SUCCESS.APPROVE');
              this.refreshTable();
            },
            error: (error: RPCError) => {
              this.showErrorDialog(
                'VO_DETAIL.APPLICATION.ERROR.APPROVE',
                error,
                this.translate.instant('VO_DETAIL.APPLICATION.ERROR.APPROVE_DESCRIPTION', {
                  error: error.message,
                }),
              );
              this.refreshTable();
            },
          });
      }
    });
  }

  onReject(): void {
    const dialogRef = this.openDialog(
      'VO_DETAIL.APPLICATION.DIALOG.REJECT.TITLE',
      'VO_DETAIL.APPLICATION.DIALOG.REJECT.DESCRIPTION',
      'VO_DETAIL.APPLICATION.APPLICATION_DETAIL.REJECT',
      'REJECT',
      this.selectedApplications,
      this.currentColumns,
    );
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.registrarService
          .rejectApplications(this.selectedApplications.map((app) => app.id))
          .subscribe({
            next: () => {
              this.notificator.showInstantSuccess('VO_DETAIL.APPLICATION.SUCCESS.REJECT');
              this.refreshTable();
            },
            error: (error: RPCError) => {
              this.showErrorDialog(
                'VO_DETAIL.APPLICATION.ERROR.REJECT',
                error,
                this.translate.instant('VO_DETAIL.APPLICATION.ERROR.REJECT_DESCRIPTION', {
                  error: error.message,
                }),
              );
              this.refreshTable();
            },
          });
      }
    });
  }

  onDelete(): void {
    const dialogRef = this.openDialog(
      'VO_DETAIL.APPLICATION.DIALOG.DELETE.TITLE',
      'VO_DETAIL.APPLICATION.DIALOG.DELETE.DESCRIPTION',
      'VO_DETAIL.APPLICATION.APPLICATION_DETAIL.DELETE',
      'DELETE',
      this.selectedApplications,
      this.currentColumns,
    );
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.registrarService
          .deleteApplications(this.selectedApplications.map((app) => app.id))
          .subscribe({
            next: () => {
              this.notificator.showInstantSuccess('VO_DETAIL.APPLICATION.SUCCESS.DELETE');
              this.refreshTable();
            },
          });
      }
    });
  }

  onResend(): void {
    const dialogRef = this.openDialog(
      'VO_DETAIL.APPLICATION.DIALOG.RESEND.TITLE',
      'VO_DETAIL.APPLICATION.DIALOG.RESEND.DESCRIPTION',
      'VO_DETAIL.APPLICATION.APPLICATION_DETAIL.SEND_NOTIFICATION',
      'RESEND',
      this.selectedApplications,
      this.currentColumns,
    );
    dialogRef.afterClosed().subscribe((resendForm: { type: MailType; reason: string }) => {
      if (resendForm) {
        this.registrarService
          .sendMessages({
            ids: this.selectedApplications.map((app) => app.id),
            mailType: resendForm.type,
            reason: resendForm.reason,
          })
          .subscribe({
            next: () => {
              this.notificator.showInstantSuccess('VO_DETAIL.APPLICATION.SUCCESS.RESEND');
              this.refreshTable();
            },
          });
      }
    });
  }

  statesChanged(states: AppState[]): void {
    this.currentStates = states;
    this.cd.detectChanges();
  }

  viewChanged(): void {
    this.changeView.emit();
  }

  toggleDetailedView(): void {
    this.showAllDetails = !this.showAllDetails;
    this.currentColumns = this.setColumns();

    this.tooltipMessages.columnSettings = this.translate.instant(
      this.showAllDetails
        ? 'VO_DETAIL.APPLICATION.COLUMNS_TOOLTIP'
        : 'VO_DETAIL.APPLICATION.SET_COLUMN_SETTINGS',
    );
    this.cd.detectChanges();
  }

  toggleIncludeGroups(): void {
    this.showGroupApps = !this.showGroupApps;
    this.currentColumns = this.setColumns();
    this.cd.detectChanges();
  }

  onSelectedApplicationsChange(applications: Application[]): void {
    this.selectedApplications = applications;
    const state = this.getSelectedState();
    this.setCanPerform(state);
    this.setButtonsTooltips(state);
  }

  private getSelectedState(): AppState {
    if (this.selectedApplications.length === 0) return null;

    let state = this.selectedApplications[0].state;
    for (const app of this.selectedApplications) {
      if (app.state !== state) {
        state = null;
        break;
      }
    }

    return state;
  }

  private setCanPerform(state: AppState): void {
    this.canPerformAction.approve = state === 'NEW' || state === 'VERIFIED';
    this.canPerformAction.reject = state === 'NEW' || state === 'VERIFIED';
    this.canPerformAction.delete = state === 'NEW' || state === 'REJECTED';
    this.canPerformAction.resend = !!state;
  }

  private setButtonsTooltips(state: AppState): void {
    if (state) {
      this.tooltipMessages.approve = this.translate.instant(
        `VO_DETAIL.APPLICATION.TOOLTIPS.APPROVE.${state}`,
      );
      this.tooltipMessages.reject = this.translate.instant(
        `VO_DETAIL.APPLICATION.TOOLTIPS.REJECT.${state}`,
      );
      this.tooltipMessages.delete = this.translate.instant(
        `VO_DETAIL.APPLICATION.TOOLTIPS.DELETE.${state}`,
      );
      this.tooltipMessages.resend = this.translate.instant(
        `VO_DETAIL.APPLICATION.TOOLTIPS.SEND_NOTIFICATION.${state}`,
      );
    } else {
      const tooltip = this.translate.instant(
        this.selectedApplications.length
          ? 'VO_DETAIL.APPLICATION.TOOLTIPS.MULTIPLE_STATUSES_SELECTED'
          : 'VO_DETAIL.APPLICATION.TOOLTIPS.NO_APPLICATION_SELECTED',
      );
      this.tooltipMessages.approve = tooltip;
      this.tooltipMessages.reject = tooltip;
      this.tooltipMessages.delete = tooltip;
      this.tooltipMessages.resend = tooltip;
    }

    this.tooltipMessages.columnSettings = this.translate.instant(
      this.showAllDetails
        ? 'VO_DETAIL.APPLICATION.COLUMNS_TOOLTIP'
        : 'VO_DETAIL.APPLICATION.SET_COLUMN_SETTINGS',
    );
  }

  private openDialog(
    title: string,
    description: string,
    confirmButtonLabel: string,
    selectedAction: 'APPROVE' | 'REJECT' | 'DELETE' | 'RESEND',
    applications: Application[],
    columns: string[],
  ): MatDialogRef<ApplicationsBulkOperationDialogComponent> {
    const columnsToDisplay = columns.filter(
      (column) => column !== 'checkbox' && column !== 'state',
    );

    const config = getDefaultDialogConfig();
    config.width = '1300px';
    config.data = {
      theme: this.theme,
      title: title,
      description: description,
      confirmButtonLabel: confirmButtonLabel,
      action: selectedAction,
      selectedApplications: applications,
      displayedColumns: columnsToDisplay,
      allowGroupMailType: !!this.group,
      fedColumnsFriendly: this.configuredFedColumns,
      fedColumnsDisplay: this.configuredFedColumns.map(
        (name) => this.fedAttrs.find((attr) => attr.friendlyName === name)?.displayName || '',
      ),
    };

    return this.dialog.open(ApplicationsBulkOperationDialogComponent, config);
  }

  private setColumns(): string[] {
    let columns: string[] = this.prependColumns;
    if (this.showGroupApps) {
      columns = this.prependColumns.concat(this.groupPrependColumns);
    }
    if (this.showAllDetails) {
      return columns.concat(this.detailedColumns);
    }
    if (this.configuredColumns.length > 0) {
      return columns.concat(this.configuredColumns);
    }

    return columns.concat(this.simpleColumns);
  }

  private yearAgo(): Date {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - 365);
    return newDate;
  }

  // FIXME: showErrorDialog() and createNotificationData() are part of a quickfix and to be remove after proper fix is made
  private showErrorDialog(title: string, error: RPCError, description: string): void {
    const notificationData: NotificationData = this.createNotificationData(
      title,
      error,
      description,
    );
    this.dialog.open(NotificationDialogComponent, {
      width: '550px',
      data: notificationData,
      autoFocus: false,
    });
  }

  private createNotificationData(
    title: string,
    error?: RPCError,
    description?: string,
  ): NotificationData {
    const notificationData: NotificationData = {
      type: 'error',
      error: error,
      description: description,
      title: this.translate.instant(title),
      actionText: this.notificator.getDefaultActionMessage(),
      delay: this.notificator.defaultErrorDelayMs,
      icon: 'error_outline',
      action: null,
      timeStamp: `${new Date().getHours()}:${new Date().getMinutes()}`,
    };
    return notificationData;
  }
}
