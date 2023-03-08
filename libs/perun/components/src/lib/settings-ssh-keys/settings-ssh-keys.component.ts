import { Component, OnInit } from '@angular/core';
import { EntityStorageService, StoreService } from '@perun-web-apps/perun/services';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { AddSshDialogComponent } from '@perun-web-apps/perun/dialogs';
import { RemoveStringValueDialogComponent } from '@perun-web-apps/perun/dialogs';
import { TranslateService } from '@ngx-translate/core';
import { ShowSshDialogComponent } from '@perun-web-apps/perun/dialogs';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-settings-ssh-keys',
  templateUrl: './settings-ssh-keys.component.html',
  styleUrls: ['./settings-ssh-keys.component.scss'],
})
export class SettingsSSHKeysComponent implements OnInit {
  userKeys: string[] = [];

  userUrn = 'urn:perun:user:attribute-def:def:sshPublicKey';

  userKeyAttribute: Attribute;

  userId: number;
  selection = new SelectionModel<string>(false, []);

  removeDialogTitle: string;
  removeDialogDescription: string;

  alertText: string;
  headerColumnText: string;

  loading: boolean;

  constructor(
    private store: StoreService,
    private attributesManagerService: AttributesManagerService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private entityStorageService: EntityStorageService
  ) {
    translateService
      .get('SHARED_LIB.PERUN.COMPONENTS.SSH_KEYS.REMOVE_DIALOG_DESCRIPTION')
      .subscribe((value: string) => (this.removeDialogDescription = value));
    translateService
      .get('SHARED_LIB.PERUN.COMPONENTS.SSH_KEYS.REMOVE_DIALOG_TITLE')
      .subscribe((value: string) => (this.removeDialogTitle = value));
    translateService
      .get('ALERTS.NO_ALT_PASSWORDS')
      .subscribe((value: string) => (this.alertText = value));
    translateService
      .get('SHARED_LIB.PERUN.COMPONENTS.SSH_KEYS.HEADER_COLUMN')
      .subscribe((value: string) => (this.headerColumnText = value));
  }

  ngOnInit(): void {
    if (window.location.pathname.startsWith('/myProfile')) {
      this.userId = this.entityStorageService.getEntity().id;
    } else {
      this.userId = this.store.getPerunPrincipal().userId;
    }
    this.translateService.onLangChange.subscribe(() => {
      this.translateService
        .get('SHARED_LIB.PERUN.COMPONENTS.SSH_KEYS.REMOVE_DIALOG_DESCRIPTION')
        .subscribe((value: string) => (this.removeDialogDescription = value));
      this.translateService
        .get('SHARED_LIB.PERUN.COMPONENTS.SSH_KEYS.REMOVE_DIALOG_TITLE')
        .subscribe((value: string) => (this.removeDialogTitle = value));
      this.translateService
        .get('ALERTS.NO_ALT_PASSWORDS')
        .subscribe((value: string) => (this.alertText = value));
      this.translateService
        .get('SHARED_LIB.PERUN.COMPONENTS.SSH_KEYS.HEADER_COLUMN')
        .subscribe((value: string) => (this.headerColumnText = value));
    });
    this.loading = true;
    this.getUserSSH();
  }

  addKey(): void {
    const config = getDefaultDialogConfig();
    config.width = '850px';
    config.data = {
      attribute: this.userKeyAttribute,
      userId: this.userId,
    };

    const dialogRef = this.dialog.open(AddSshDialogComponent, config);

    dialogRef.afterClosed().subscribe((sshAdded) => {
      if (sshAdded) {
        this.getUserSSH();
      }
    });
  }

  removeKey(key: string): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      values: [key],
      attribute: this.userKeyAttribute,
      userId: this.userId,
      title: this.removeDialogTitle,
      description: this.removeDialogDescription,
    };

    const dialogRef = this.dialog.open(RemoveStringValueDialogComponent, config);

    dialogRef.afterClosed().subscribe((sshAdded) => {
      if (sshAdded) {
        this.loading = true;
        this.getUserSSH();
        this.selection.clear();
      }
    });
  }

  getUserSSH(): void {
    this.attributesManagerService
      .getUserAttributeByName(this.userId, this.userUrn)
      .subscribe((sshKeys) => {
        this.userKeyAttribute = sshKeys;
        this.userKeys = sshKeys.value as string[];
        this.loading = false;
      });
  }

  showWholeKey(key: string): void {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      value: key,
    };

    this.dialog.open(ShowSshDialogComponent, config);
  }
}
