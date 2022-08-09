import { Component, OnInit } from '@angular/core';
import {
  AttributesManagerService,
  RegistrarManagerService,
  RichUserExtSource,
  UserExtSource,
  UsersManagerService,
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemoveUserExtSourceDialogComponent } from '@perun-web-apps/perun/dialogs';
import { LinkerResult, OpenLinkerService } from '@perun-web-apps/lib-linker';
import { TranslateService } from '@ngx-translate/core';
import { Urns } from '@perun-web-apps/perun/urns';

@Component({
  selector: 'perun-web-apps-identities-page',
  templateUrl: './identities-page.component.html',
  styleUrls: ['./identities-page.component.scss'],
})
export class IdentitiesPageComponent implements OnInit {
  idpExtSources: RichUserExtSource[] = [];
  certExtSources: RichUserExtSource[] = [];
  otherExtSources: RichUserExtSource[] = [];
  idpSelection: SelectionModel<UserExtSource> = new SelectionModel<UserExtSource>(true, []);
  certSelection: SelectionModel<UserExtSource> = new SelectionModel<UserExtSource>(true, []);
  otherSelection: SelectionModel<UserExtSource> = new SelectionModel<UserExtSource>(true, []);

  loginIdp = 'IDENTITIES.LOGIN_IDP';
  extSourceNameCert = 'IDENTITIES.EXT_SOURCE_NAME_CERT';
  loginCert = 'IDENTITIES.LOGIN_CERT';
  extSourceNameOther = 'IDENTITIES.EXT_SOURCE_NAME_OTHER';

  userId: number;
  loading: boolean;
  displayCertificates: boolean;

  displayedColumnsIdp = ['select', 'extSourceName', 'login', 'mail', 'lastAccess'];
  displayedColumnsCert = ['select', 'extSourceName', 'login', 'lastAccess'];
  displayedColumnsOther = ['extSourceName', 'login', 'lastAccess'];

  constructor(
    private usersManagerService: UsersManagerService,
    private storage: StoreService,
    private dialog: MatDialog,
    private attributesManagerService: AttributesManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private registrarManagerService: RegistrarManagerService,
    private openLinkerService: OpenLinkerService
  ) {}

  ngOnInit(): void {
    this.userId = this.storage.getPerunPrincipal().userId;
    this.displayCertificates = this.storage.get('display_identity_certificates') as boolean;
    this.refreshTables();
  }

  refreshTables(): void {
    this.loading = true;
    this.idpExtSources = [];
    this.certExtSources = [];
    this.otherExtSources = [];
    this.usersManagerService.getRichUserExtSources(this.userId).subscribe((userExtSources) => {
      let count = userExtSources.length;
      userExtSources.forEach((ues) => {
        this.attributesManagerService
          .getUserExtSourceAttributesByNames(ues.userExtSource.id, [
            Urns.UES_SOURCE_IDP_NAME,
            Urns.UES_DEF_MAIL,
          ])
          .subscribe((attributes) => {
            attributes
              .filter((attr) => attr.baseFriendlyName === 'mail' && attr.value === null)
              .map((attr) => ues.attributes.push(attr));
            let sourceName: string;
            attributes
              .filter((attr) => attr.baseFriendlyName === 'sourceIdPName' && attr?.value)
              .map((attr) => (sourceName = attr.value as string));
            if (sourceName) {
              ues.userExtSource.extSource.name = sourceName;
              count--;
              this.loading = count !== 0;
              this.addToList(ues);
            } else {
              this.attributesManagerService
                .getUserExtSourceAttributeByName(
                  ues.userExtSource.id,
                  Urns.UES_IDP_ORGANIZATION_NAME
                )
                .subscribe((orgName) => {
                  count--;
                  if (orgName?.value) {
                    ues.userExtSource.extSource.name = orgName.value as string;
                  }
                  this.loading = count !== 0;
                  this.addToList(ues);
                });
            }
          });
      });
    });
  }

  removeIdentity(selection: SelectionModel<UserExtSource>): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      theme: 'user-theme',
      userId: this.userId,
      extSources: selection.selected,
    };

    const dialogRef = this.dialog.open(RemoveUserExtSourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        selection.clear();
        this.refreshTables();
      }
    });
  }

  addIdentity(): void {
    if (this.storage.getProperty('use_new_consolidator')) {
      this.openLinkerService.openLinkerWindow((result: LinkerResult) => {
        if (result === 'TOKEN_EXPIRED') {
          location.reload();
        } else if (result === 'OK') {
          this.notificator.showSuccess(
            this.translate.instant('IDENTITIES.SUCCESSFULLY_ADDED') as string
          );
          this.refreshTables();
        } else if (result === 'MESSAGE_SENT_TO_SUPPORT') {
          this.notificator.showSuccess(
            this.translate.instant('IDENTITIES.MESSAGE_SENT_TO_SUPPORT') as string
          );
        }
      });
    } else {
      this.registrarManagerService.getConsolidatorToken().subscribe((token) => {
        const type = this.storage.getPerunPrincipal().extSourceType;
        const consolidatorBaseUrl = this.storage.get('consolidator_base_url') as string;
        window.location.href = `${consolidatorBaseUrl}${
          type?.endsWith('X509') ? 'cert' : 'fed'
        }-ic/ic/?target_url=${window.location.href}&token=${token}`;
      });
    }
  }

  private addToList(ues: RichUserExtSource): void {
    if (ues.userExtSource.extSource.type.endsWith('Idp')) {
      this.idpExtSources.push(ues);
    } else if (ues.userExtSource.extSource.type.endsWith('X509')) {
      this.certExtSources.push(ues);
    } else {
      this.otherExtSources.push(ues);
    }
  }
}
