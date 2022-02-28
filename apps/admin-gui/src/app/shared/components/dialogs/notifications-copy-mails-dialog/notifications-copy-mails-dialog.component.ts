import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { openClose } from '@perun-web-apps/perun/animations';
import {
  Group,
  GroupsManagerService,
  RegistrarManagerService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';

export interface NotificationsCopyMailsDialogData {
  theme: string;
  voId: number;
  groupId: number;
}

@Component({
  selector: 'app-notifications-copy-mails-dialog',
  templateUrl: './notifications-copy-mails-dialog.component.html',
  styleUrls: ['./notifications-copy-mails-dialog.component.scss'],
  animations: [openClose],
})
export class NotificationsCopyMailsDialogComponent implements OnInit {
  vos: Vo[] = [];
  groups: Group[] = [];
  fakeGroup: Group;
  selectedVo: Vo = null;
  selectedGroup: Group = null;
  theme: string;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<NotificationsCopyMailsDialogComponent>,
    private voService: VosManagerService,
    private groupService: GroupsManagerService,
    private translateService: TranslateService,
    private registrarService: RegistrarManagerService,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: NotificationsCopyMailsDialogData
  ) {}

  nameFunction: (group: Group) => string = (group: Group) => group.name;

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.loading = true;
    this.translateService.get('DIALOGS.NOTIFICATIONS_COPY_MAILS.NO_GROUP_SELECTED').subscribe(
      (text: string) => {
        this.fakeGroup = {
          id: -1,
          name: text,
          voId: 0,
          parentGroupId: 0,
          shortName: '',
          description: '',
          beanName: 'group',
        };
        this.selectedGroup = this.fakeGroup;

        this.voService.getAllVos().subscribe((vos) => {
          this.vos = vos;
          this.loading = false;
        });
      },
      () => (this.loading = false)
    );
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.loading = true;
    if (this.data.groupId) {
      // checking if the dialog is for group or Vo
      if (this.selectedGroup === this.fakeGroup) {
        this.registrarService
          .copyMailsFromVoToGroup(this.selectedVo.id, this.data.groupId)
          .subscribe(
            () => {
              this.dialogRef.close(true);
            },
            () => (this.loading = false)
          );
      } else {
        this.registrarService
          .copyMailsFromGroupToGroup(this.selectedGroup.id, this.data.groupId)
          .subscribe(
            () => {
              this.dialogRef.close(true);
            },
            () => (this.loading = false)
          );
      }
    } else {
      if (this.selectedGroup === this.fakeGroup) {
        this.registrarService.copyMailsFromVoToVo(this.selectedVo.id, this.data.voId).subscribe(
          () => {
            this.dialogRef.close(true);
          },
          () => (this.loading = false)
        );
      } else {
        this.registrarService
          .copyMailsFromGroupToVo(this.selectedGroup.id, this.data.voId)
          .subscribe(
            () => {
              this.dialogRef.close(true);
            },
            () => (this.loading = false)
          );
      }
    }
  }

  voSelected(vo: Vo): void {
    this.selectedVo = vo;
    this.getGroups();
    this.cd.detectChanges();
  }

  getGroups(): void {
    if (this.selectedVo) {
      this.groupService.getAllGroups(this.selectedVo.id).subscribe((groups) => {
        this.groups = [this.fakeGroup].concat(groups);
      });
    } else {
      this.groups = [this.fakeGroup];
    }
  }
}
