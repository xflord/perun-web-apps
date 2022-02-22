import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ChangeGroupResourceAssigmentDialogComponent } from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'perun-web-apps-group-resource-status',
  templateUrl: './group-resource-status.component.html',
  styleUrls: ['./group-resource-status.component.css'],
})
export class GroupResourceStatusComponent {
  @Input() status = '';
  @Input() groupId: number;
  @Input() resourceId: number;
  @Input() theme: string;
  @Input() failureCause: string;
  @Output() statusChange: EventEmitter<void> = new EventEmitter<void>();

  constructor(private dialog: MatDialog) {}

  changeStatus(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      theme: this.theme,
      status: this.status,
      groupId: this.groupId,
      resourceId: this.resourceId,
    };

    const dialogRef = this.dialog.open(ChangeGroupResourceAssigmentDialogComponent, config);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.statusChange.emit();
      }
    });
  }
}
