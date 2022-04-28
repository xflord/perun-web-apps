import { Component, OnInit } from '@angular/core';
import { fadeIn } from '@perun-web-apps/perun/animations';
import {
  ConsentsManagerService,
  InputUpdateService,
  Service,
  ServicesManagerService,
} from '@perun-web-apps/perun/openapi';
import { ActivatedRoute, Router } from '@angular/router';
import { SideMenuService } from '../../../../../core/services/common/side-menu.service';
import { SideMenuItemService } from '../../../../../shared/side-menu/side-menu-item.service';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditServiceDialogComponent } from '../../../../../shared/components/dialogs/create-edit-service-dialog/create-edit-service-dialog.component';
import {
  EntityStorageService,
  GuiAuthResolver,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { DeleteServiceDialogComponent } from '../../../../../shared/components/dialogs/delete-service-dialog/delete-service-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { UniversalConfirmationItemsDialogComponent } from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'app-service-detail-page',
  templateUrl: './service-detail-page.component.html',
  styleUrls: ['./service-detail-page.component.scss'],
  animations: [fadeIn],
})
export class ServiceDetailPageComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consentsManager: ConsentsManagerService,
    private serviceManager: ServicesManagerService,
    private sideMenuService: SideMenuService,
    private sideMenuItemService: SideMenuItemService,
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private entityStorageService: EntityStorageService
  ) {}

  service: Service;
  serviceId: number;
  loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe((params) => {
      this.serviceId = params['serviceId'];
      this.refresh();
    });
  }

  refresh() {
    this.serviceManager.getServiceById(this.serviceId).subscribe(
      (service) => {
        this.service = service;
        this.entityStorageService.setEntity({ id: service.id, beanName: service.beanName });

        const serviceItems = this.sideMenuItemService.parseService(this.service);
        this.sideMenuService.setAdminItems([serviceItems]);
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  editService() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      theme: 'service-theme',
      service: this.service,
    };

    const dialogRef = this.dialog.open(CreateEditServiceDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ngOnInit();
      }
    });
  }

  removeService() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      theme: 'service-theme',
      services: [this.service],
    };
    const dialogRef = this.dialog.open(DeleteServiceDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/admin/services']);
      }
    });
  }

  changeServiceStatus() {
    this.loading = true;
    const inputService: InputUpdateService = {
      service: {
        name: this.service.name,
        description: this.service.description,
        delay: this.service.delay,
        recurrence: this.service.recurrence,
        enabled: !this.service.enabled,
        script: this.service.script,
        id: this.service.id,
        beanName: this.service.beanName,
      },
    };
    this.serviceManager.updateService(inputService).subscribe(
      () => {
        this.notificator.showSuccess(
          this.translate.instant('SERVICE_DETAIL.STATUS_CHANGE_SUCCESS')
        );
        this.refresh();
      },
      () => (this.loading = false)
    );
  }

  evaluateConsents() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      title: this.translate.instant('SERVICE_DETAIL.CONFIRM_DIALOG_TITLE'),
      theme: 'service-theme',
      description: this.translate.instant('SERVICE_DETAIL.CONFIRM_DIALOG_DESCRIPTION'),
      items: [this.service.name],
      type: 'confirmation',
      showAsk: false,
    };

    const dialogRef = this.dialog.open(UniversalConfirmationItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.consentsManager
          .evaluateConsentsForService(this.service.id)
          .subscribe(() =>
            this.notificator.showSuccess(this.translate.instant('SERVICE_DETAIL.EVALUATION_FINISH'))
          );
      }
    });
  }
}
