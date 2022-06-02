import { Component, OnInit } from '@angular/core';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import { fadeIn } from '@perun-web-apps/perun/animations';
import { EnrichedVo, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import {
  addRecentlyVisited,
  addRecentlyVisitedObject,
  getDefaultDialogConfig,
} from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { EntityStorageService, GuiAuthResolver } from '@perun-web-apps/perun/services';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions,
} from '@perun-web-apps/perun/dialogs';
import { RemoveVoDialogComponent } from '../../../shared/components/dialogs/remove-vo-dialog/remove-vo-dialog.component';
import { ReloadEntityDetailService } from '../../../core/services/common/reload-entity-detail.service';
import { destroyDetailMixin } from '../../../shared/destroy-entity-detail';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-vo-detail-page',
  templateUrl: './vo-detail-page.component.html',
  styleUrls: ['./vo-detail-page.component.scss'],
  animations: [fadeIn],
})
export class VoDetailPageComponent extends destroyDetailMixin() implements OnInit {
  vo: Vo;
  enrichedVo: EnrichedVo;
  editAuth: boolean;
  loading = false;
  removeAuth: boolean;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private sideMenuItemService: SideMenuItemService,
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private entityStorageService: EntityStorageService,
    private reloadEntityDetail: ReloadEntityDetailService
  ) {
    super();
  }

  ngOnInit(): void {
    this.reloadData();
    this.reloadEntityDetail.entityDetailChange.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.reloadData();
    });
  }

  reloadData(): void {
    this.loading = true;
    this.route.params.subscribe((params) => {
      const voId = Number(params['voId']);

      this.voService.getEnrichedVoById(voId).subscribe(
        (enrichedVo) => {
          this.vo = enrichedVo.vo;
          this.enrichedVo = enrichedVo;
          this.entityStorageService.setEntity({ id: this.vo.id, beanName: this.vo.beanName });
          this.editAuth = this.authResolver.isAuthorized('updateVo_Vo_policy', [this.vo]);
          this.removeAuth = this.authResolver.isAuthorized('deleteVo_Vo_policy', [this.vo]);

          this.setMenuItems();

          addRecentlyVisited('vos', this.vo);
          addRecentlyVisitedObject(this.vo);

          this.loading = false;
        },
        () => (this.loading = false)
      );
    });
  }

  editVo(): void {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      theme: 'vo-theme',
      vo: this.vo,
      dialogType: EditFacilityResourceGroupVoDialogOptions.VO,
    };
    const dialogRef = this.dialog.open(EditFacilityResourceGroupVoDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.voService.getVoById(this.vo.id).subscribe((vo) => {
          this.vo = vo;
          this.setMenuItems();
        });
      }
    });
  }

  setMenuItems(): void {
    const isHierarchical = this.enrichedVo.memberVos.length !== 0;
    const isMemberVo = this.enrichedVo.parentVos.length !== 0;
    const sideMenuItem = this.sideMenuItemService.parseVo(this.vo, isHierarchical, isMemberVo);
    this.sideMenuService.setAccessMenuItems([sideMenuItem]);
  }

  removeVo(): void {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      theme: 'vo-theme',
      vos: [this.vo],
    };
    const dialogRef = this.dialog.open(RemoveVoDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        void this.router.navigate(['']);
      }
    });
  }
}
