import { Component, HostBinding, OnInit } from '@angular/core';
import { openClose } from '@perun-web-apps/perun/animations';
import { EntityStorageService, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { Urns } from '@perun-web-apps/perun/urns';
import { ApiRequestConfigurationService } from '@perun-web-apps/perun/services';
import { Attribute, AttributesManagerService, Vo } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-vo-settings-expiration',
  templateUrl: './vo-settings-expiration.component.html',
  styleUrls: ['./vo-settings-expiration.component.scss'],
  animations: [openClose],
})
export class VoSettingsExpirationComponent implements OnInit {
  @HostBinding('class.router-component') true;

  constructor(
    private attributesManager: AttributesManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private apiRequest: ApiRequestConfigurationService,
    private entityStorageService: EntityStorageService
  ) {
    this.translate
      .get('VO_DETAIL.SETTINGS.EXPIRATION.SUCCESS_MESSAGE')
      .subscribe((value) => (this.successMessage = value));
    this.translate
      .get('VO_DETAIL.SETTINGS.EXPIRATION.ERROR_MESSAGE')
      .subscribe((value) => (this.errorMessage = value));
  }

  expirationAttribute: Attribute;

  successMessage: string;
  errorMessage: string;

  vo: Vo;

  ngOnInit() {
    this.vo = this.entityStorageService.getEntity();
    this.loadSettings();
  }

  private loadSettings(): void {
    this.attributesManager
      .getVoAttributeByName(this.vo.id, Urns.VO_DEF_EXPIRATION_RULES)
      .subscribe((attr) => {
        this.expirationAttribute = attr;
      });
  }

  saveExpirationAttribute(attribute: Attribute) {
    // FIXME this might not work in case of some race condition (other request finishes sooner)
    this.apiRequest.dontHandleErrorForNext();

    this.attributesManager.setVoAttribute({ vo: this.vo.id, attribute: attribute }).subscribe(
      () => {
        this.loadSettings();
        this.notificator.showSuccess(this.successMessage);
      },
      (error) => {
        console.log(error);
        this.notificator.showRPCError(error.error, this.errorMessage);
      }
    );
  }
}
