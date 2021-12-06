import {Component, HostBinding, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { EntityStorageService, NotificatorService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { ApiRequestConfigurationService } from '@perun-web-apps/perun/services';
import { Attribute, AttributesManagerService, Group } from '@perun-web-apps/perun/openapi';


@Component({
  selector: 'app-group-settings-expiration',
  templateUrl: './group-settings-expiration.component.html',
  styleUrls: ['./group-settings-expiration.component.scss']
})
export class GroupSettingsExpirationComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private attributesManager: AttributesManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private apiRequest: ApiRequestConfigurationService,
    private entityStorageService: EntityStorageService
  ) {
    this.translate.get('GROUP_DETAIL.SETTINGS.EXPIRATION.SUCCESS_MESSAGE').subscribe(value => this.successMessage = value);
    this.translate.get('GROUP_DETAIL.SETTINGS.EXPIRATION.ERROR_MESSAGE').subscribe(value => this.errorMessage = value);
  }

  expirationAttribute: Attribute;

  successMessage: string;
  errorMessage: string;

  group: Group;

  ngOnInit() {
    this.group = this.entityStorageService.getEntity();
    this.loadSettings();
  }

  private loadSettings(): void {
    this.attributesManager.getGroupAttributeByName(this.group.id, Urns.GROUP_DEF_EXPIRATION_RULES).subscribe(attr => {
      this.expirationAttribute = attr;
    });
  }

  saveExpirationAttribute(attribute: Attribute) {
    // FIXME this might not work in case of some race condition (other request finishes sooner)
    this.apiRequest.dontHandleErrorForNext();

    this.attributesManager.setGroupAttribute({group: this.group.id, attribute: attribute}).subscribe( () => {
        this.loadSettings();
        this.notificator.showSuccess(this.successMessage);
      },
      error => this.notificator.showRPCError(error.error, this.errorMessage));
  }
}
