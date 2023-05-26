import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Group } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_APPLICATION_FORM_ITEM_MANAGE_GROUP } from '@perun-web-apps/config/table-config';
import { Observable } from 'rxjs';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { UniversalConfirmationItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-application-form-manage-groups',
  templateUrl: './application-form-manage-groups.component.html',
  styleUrls: ['./application-form-manage-groups.component.css'],
})
export class ApplicationFormManageGroupsComponent {
  @Input() loading: boolean;
  @Input() groups: Group[] = [];
  @Input() selected = new SelectionModel<Group>(true, []);
  @Input() addAuth: boolean;
  @Input() removeAuth$: Observable<boolean>;

  @Output() refreshEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() addEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() removeEvent: EventEmitter<void> = new EventEmitter<void>();

  tableId = TABLE_APPLICATION_FORM_ITEM_MANAGE_GROUP;
  filterValue = '';

  constructor(private dialog: MatDialog) {}

  removeGroups(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      items: this.selected.selected.map((group) => group.name),
      title: 'VO_DETAIL.SETTINGS.APPLICATION_FORM.MANAGE_GROUPS_PAGE.REMOVE_GROUP_DIALOG_TITLE',
      description:
        'VO_DETAIL.SETTINGS.APPLICATION_FORM.MANAGE_GROUPS_PAGE.REMOVE_GROUP_DIALOG_DESCRIPTION',
      theme: 'vo-theme',
      type: 'remove',
      showAsk: true,
    };

    const dialogRef = this.dialog.open(UniversalConfirmationItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.removeEvent.emit();
      }
    });
  }
}
