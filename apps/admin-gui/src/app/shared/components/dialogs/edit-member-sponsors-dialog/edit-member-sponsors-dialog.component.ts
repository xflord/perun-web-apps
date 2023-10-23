import { Component, Inject, OnInit } from '@angular/core';
import {
  Member,
  MembersManagerService,
  Sponsor,
  UsersManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  GuiAuthResolver,
  NotificatorService,
  PerunTranslateService,
} from '@perun-web-apps/perun/services';
import { MatTableDataSource } from '@angular/material/table';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ChangeSponsorshipExpirationDialogComponent } from '@perun-web-apps/perun/dialogs';
export interface EditMemberSponsorsDialogComponent {
  theme: string;
  sponsors: Sponsor[];
  member: Member;
}

@Component({
  selector: 'app-edit-member-sponsors-dialog',
  templateUrl: './edit-member-sponsors-dialog.component.html',
  styleUrls: ['./edit-member-sponsors-dialog.component.scss'],
})
export class EditMemberSponsorsDialogComponent implements OnInit {
  theme: string;
  sponsors: Sponsor[];
  displayedColumns: string[] = ['id', 'name', 'expiration', 'remove'];
  dataSource: MatTableDataSource<Sponsor>;
  loading = false;
  sponsorsToRemove: Set<number> = new Set<number>();
  member: Member;
  vo: Vo;
  private expirationChanged = false;

  constructor(
    private dialogRef: MatDialogRef<EditMemberSponsorsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: EditMemberSponsorsDialogComponent,
    private memberService: MembersManagerService,
    private userService: UsersManagerService,
    private notificator: NotificatorService,
    private authResolver: GuiAuthResolver,
    private translate: PerunTranslateService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.sponsors = this.data.sponsors;
    this.member = this.data.member;
    this.dataSource = new MatTableDataSource<Sponsor>(this.data.sponsors);
    this.vo = {
      beanName: 'Vo',
      id: this.data.member.voId,
    };
  }

  markSponsor(sponsor: Sponsor): void {
    if (this.sponsorsToRemove.has(sponsor.user.id)) {
      this.sponsorsToRemove.delete(sponsor.user.id);
    } else {
      this.sponsorsToRemove.add(sponsor.user.id);
    }
  }

  onSubmit(): void {
    this.loading = true;
    const sponsorIds = Array.from(this.sponsorsToRemove);
    this.removeSponsors(sponsorIds);
  }

  onCancel(): void {
    this.dialogRef.close(this.expirationChanged);
  }

  changeExpiration(sponsor: Sponsor): void {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      memberId: this.data.member.id,
      sponsor: sponsor,
    };

    const dialogRef = this.dialog.open(ChangeSponsorshipExpirationDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.expirationChanged = true;
        this.userService.getSponsorsForMember(this.data.member.id, []).subscribe((sponsors) => {
          this.sponsors = sponsors;
          this.dataSource = new MatTableDataSource<Sponsor>(this.sponsors);
          this.loading = false;
        });
      }
    });
  }

  private removeSponsors(sponsorIds: number[]): void {
    this.memberService.removeSponsors(this.data.member.id, sponsorIds).subscribe({
      next: () => {
        this.notificator.showSuccess(
          this.translate.instant('DIALOGS.EDIT_MEMBER_SPONSORS.SUCCESS'),
        );
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => (this.loading = false),
    });
  }
}
