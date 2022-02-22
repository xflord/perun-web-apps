import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GroupFlatNode } from '@perun-web-apps/perun/models';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-group-menu',
  templateUrl: './group-menu.component.html',
  styleUrls: ['./group-menu.component.scss'],
})
export class GroupMenuComponent implements OnInit {
  @Input() group: GroupFlatNode;
  @Input() disabled = false;
  @Input() displayButtons: boolean;
  @Output() moveGroup: EventEmitter<void> = new EventEmitter<void>();
  @Output() syncGroup: EventEmitter<void> = new EventEmitter<void>();
  @Output() changeNameDescription: EventEmitter<void> = new EventEmitter<void>();

  syncAuth: boolean;
  editAuth: boolean;
  moveAuth: boolean;

  constructor(private authResolver: GuiAuthResolver) {}

  ngOnInit(): void {
    this.syncAuth = this.authResolver.isAuthorized('forceGroupSynchronization_Group_policy', [
      this.group,
    ]);
    this.editAuth = this.authResolver.isAuthorized('updateGroup_Group_policy', [this.group]);
    this.moveAuth =
      this.authResolver.isAuthorized('moveGroup_Group_Group_policy', [this.group]) ||
      this.authResolver.isAuthorized('destination_null-moveGroup_Group_Group_policy', [this.group]);
  }

  onMoveGroup(): void {
    this.moveGroup.emit();
  }

  onSyncDetail(): void {
    this.syncGroup.emit();
  }

  onChangeNameDescription(): void {
    this.changeNameDescription.emit();
  }
}
