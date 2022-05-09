import { Component, OnInit, ViewChild } from '@angular/core';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { MatDialogRef } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatStepper } from '@angular/material/stepper';
import { EntityStorageService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-member-organization-dialog',
  templateUrl: './add-member-organization-dialog.component.html',
  styleUrls: ['./add-member-organization-dialog.component.scss'],
})
export class AddMemberOrganizationDialogComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  loading = false;
  theme = 'vo-theme';
  displayedColumns: string[] = ['checkbox', 'id', 'name', 'shortName'];
  columns: string[] = ['name'];
  voId: number;
  vos: Vo[] = [];
  voSelection: SelectionModel<Vo> = new SelectionModel<Vo>(false, []);
  voFilter = '';

  constructor(
    private dialogRef: MatDialogRef<AddMemberOrganizationDialogComponent>,
    private vosService: VosManagerService,
    private entityStorage: EntityStorageService,
    private notificator: NotificatorService,
    private translator: TranslateService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.voId = this.entityStorage.getEntity().id;
    this.vosService.getEnrichedVoById(this.voId).subscribe(
      (enrichedVo) => {
        this.vosService.getAllVos().subscribe(
          (vos) => {
            const memberVoIds: number[] = enrichedVo.memberVos.map((vo) => vo.id);
            this.vos = vos.filter((vo) => !memberVoIds.includes(vo.id));
            this.loading = false;
          },
          () => (this.loading = false)
        );
      },
      () => (this.loading = false)
    );
  }

  close(): void {
    this.dialogRef.close(false);
  }

  stepperNext(): void {
    this.stepper.next();
  }

  stepperPrevious(): void {
    this.stepper.previous();
  }

  addMemberOrganization(): void {
    this.loading = true;
    this.vosService.addMemberVo(this.voId, this.voSelection.selected[0].id).subscribe(
      () => {
        this.notificator.showSuccess(
          this.translator.instant(
            'VO_DETAIL.SETTINGS.MEMBER_ORGANIZATIONS.ADD_MEMBER_ORGANIZATION.SUCCESS'
          ) as string
        );
        this.dialogRef.close(true);
      },
      () => (this.loading = false)
    );
  }
}
