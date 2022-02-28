import { Component, OnInit } from '@angular/core';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-group-statistics',
  templateUrl: './group-statistics.component.html',
  styleUrls: ['./group-statistics.component.scss'],
})
export class GroupStatisticsComponent implements OnInit {
  loading = false;
  group: Group;
  voStatusCountsRowNames: string[] = ['Members', 'Valid', 'Invalid', 'Expired', 'Disabled'];
  membersCountsByVoStatus: Map<string, number> = new Map<string, number>();
  groupStatusCountsRowNames: string[] = ['Members', 'Valid', 'Expired'];
  membersCountsByGroupStatus: Map<string, number> = new Map<string, number>();

  constructor(
    private groupService: GroupsManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.group = this.entityStorageService.getEntity();
    this.groupService.getGroupMembersCount(this.group.id).subscribe(
      (count) => {
        this.membersCountsByVoStatus.set('members', count);
        this.membersCountsByGroupStatus.set('members', count);

        this.groupService.getGroupMembersCountsByVoStatus(this.group.id).subscribe(
          (statsVo) => {
            Object.entries(statsVo).forEach(([status, countVo]) =>
              this.membersCountsByVoStatus.set(status.toLowerCase(), countVo)
            );
            this.groupService.getGroupMembersCountsByGroupStatus(this.group.id).subscribe(
              (statsGroup) => {
                Object.entries(statsGroup).forEach(([status, countGroup]) =>
                  this.membersCountsByGroupStatus.set(status.toLowerCase(), countGroup)
                );
                this.loading = false;
              },
              () => (this.loading = false)
            );
          },
          () => (this.loading = false)
        );
      },
      () => (this.loading = false)
    );
  }
}
