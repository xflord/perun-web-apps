import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { StoreService } from '@perun-web-apps/perun/services';
import { Group } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-create-group-form',
  templateUrl: './create-group-form.component.html',
  styleUrls: ['./create-group-form.component.css'],
})
export class CreateGroupFormComponent implements OnInit {
  @Input() parentGroup: Group = null;
  @Input() voGroups: Group[] = [];
  @Output() nameChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() descriptionChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() parentGroupChanged: EventEmitter<Group> = new EventEmitter<Group>();
  @Output() asSubgroupChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  isNotSubGroup: boolean;
  asSubgroup = false;
  invalidNameMessage: string = this.store.get('group_name_error_message') as string;
  secondaryRegex: string = this.store.get('group_name_secondary_regex') as string;
  nameControl: FormControl;
  descriptionControl: FormControl;
  selectedParent: Group;

  constructor(private store: StoreService) {}

  ngOnInit(): void {
    this.isNotSubGroup = this.parentGroup === null;
    this.nameControl = new FormControl('', [
      Validators.required,
      Validators.pattern(this.secondaryRegex ? this.secondaryRegex : ''),
      Validators.pattern('.*[\\S]+.*'),
    ]);
    this.descriptionControl = new FormControl('', [Validators.required, Validators.maxLength(129)]);
    this.selectedParent = null;
    this.voGroups = this.voGroups.filter((grp) => grp.name !== 'members');
  }

  emitName(): void {
    if (this.nameControl.invalid) {
      this.nameChanged.emit('');
    } else {
      this.nameChanged.emit(this.nameControl.value as string);
    }
  }

  emitDescription(): void {
    if (this.descriptionControl.invalid) {
      this.descriptionChanged.emit('');
    } else {
      this.descriptionChanged.emit(this.descriptionControl.value as string);
    }
  }

  emitParentGroup(parent: Group): void {
    this.selectedParent = parent;

    this.parentGroupChanged.emit(parent);
  }

  emitAsSubGroup(): void {
    if (!this.asSubgroup) {
      this.emitParentGroup(null);
    }
    this.asSubgroupChanged.emit(this.asSubgroup);
  }
}
