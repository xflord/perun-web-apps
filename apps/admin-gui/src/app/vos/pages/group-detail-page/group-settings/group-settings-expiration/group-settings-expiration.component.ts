import { Component, HostBinding, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  ApiRequestConfigurationService,
  EntityStorageService,
  NotificatorService,
} from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { Attribute, AttributesManagerService, Group } from '@perun-web-apps/perun/openapi';
import { RPCError } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-group-settings-expiration',
  templateUrl: './group-settings-expiration.component.html',
  styleUrls: ['./group-settings-expiration.component.scss'],
})
export class GroupSettingsExpirationComponent implements OnInit {
  @HostBinding('class.router-component') true;
  expirationAttribute: Attribute;
  successMessage: string;
  errorMessage: string;
  group: Group;

  constructor(
    private attributesManager: AttributesManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private apiRequest: ApiRequestConfigurationService,
    private entityStorageService: EntityStorageService
  ) {
    this.translate
      .get('GROUP_DETAIL.SETTINGS.EXPIRATION.SUCCESS_MESSAGE')
      .subscribe((value: string) => (this.successMessage = value));
    this.translate
      .get('GROUP_DETAIL.SETTINGS.EXPIRATION.ERROR_MESSAGE')
      .subscribe((value: string) => (this.errorMessage = value));
  }

  ngOnInit(): void {
    this.group = this.entityStorageService.getEntity();
    this.loadSettings();
  }

  saveExpirationAttribute(attribute: Attribute): void {
    // FIXME this might not work in case of some race condition (other request finishes sooner)
    this.apiRequest.dontHandleErrorForNext();

    this.attributesManager
      .setGroupAttribute({ group: this.group.id, attribute: attribute })
      .subscribe({
        next: () => {
          this.loadSettings();
          this.notificator.showSuccess(this.successMessage);
        },
        error: (error: RPCError) => this.notificator.showRPCError(error, this.errorMessage),
      });
  }

  private loadSettings(): void {
    this.attributesManager
      .getGroupAttributeByName(this.group.id, Urns.GROUP_DEF_EXPIRATION_RULES)
      .subscribe((attr) => {
        this.expirationAttribute = attr;
      });
  }
}
