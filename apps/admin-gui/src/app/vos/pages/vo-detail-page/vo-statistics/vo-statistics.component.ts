import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { EntityStorageService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-statistics',
  templateUrl: './vo-statistics.component.html',
  styleUrls: ['./vo-statistics.component.scss'],
})
export class VoStatisticsComponent implements OnInit {
  loading = false;
  rowNames: string[] = ['Members', 'Valid', 'Invalid', 'Expired', 'Disabled'];
  membersCount: Map<string, number> = new Map<string, number>([
    ['members', 0],
    ['valid', 0],
    ['invalid', 0],
    ['expired', 0],
    ['disabled', 0],
  ]);
  private vo: Vo;
  private dataSource = new MatTableDataSource<string>();
  private allMembersCount: number;

  constructor(
    private voService: VosManagerService,
    private entityStorageService: EntityStorageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.vo = this.entityStorageService.getEntity();

    this.dataSource = new MatTableDataSource<string>(this.rowNames);

    this.voService.getVoMembersCountsByStatus(this.vo.id).subscribe(
      (numOfMembersByStatus) => {
        this.allMembersCount = 0;

        for (const status of Object.keys(numOfMembersByStatus)) {
          this.membersCount.set(status.toLowerCase(), numOfMembersByStatus[status]);
          this.allMembersCount += numOfMembersByStatus[status];
        }

        this.membersCount.set('members', this.allMembersCount);
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }
}
