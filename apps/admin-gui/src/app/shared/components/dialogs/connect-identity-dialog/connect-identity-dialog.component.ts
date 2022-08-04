import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RichUser, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { TABLE_USER_SERVICE_IDENTITIES } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';
import { UntypedFormControl, Validators } from '@angular/forms';

export interface AddUserServiceIdentityData {
  userId: number;
  theme: string;
  isService: boolean;
  target: 'USER' | 'SELF' | 'SERVICE';
}

@Component({
  selector: 'app-connect-identity-dialog',
  templateUrl: './connect-identity-dialog.component.html',
  styleUrls: ['./connect-identity-dialog.component.scss'],
})
export class ConnectIdentityDialogComponent implements OnInit {
  theme: string;
  loading = false;
  target: string;
  identities: RichUser[];
  selection = new SelectionModel<RichUser>(false, []);
  firstSearchDone = false;
  displayedColumns = ['select', 'id', 'user', 'name', 'email', 'logins', 'organization'];
  tableId = TABLE_USER_SERVICE_IDENTITIES;
  searchCtrl: UntypedFormControl;
  private userId: number;
  private isService: boolean;

  constructor(
    private dialogRef: MatDialogRef<ConnectIdentityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddUserServiceIdentityData,
    public userManager: UsersManagerService,
    private storeService: StoreService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.target = this.data.target;
    this.theme = this.data.theme;
    this.userId = this.data.userId;
    this.isService = this.data.isService;
    this.searchCtrl = new UntypedFormControl('', [
      Validators.required,
      Validators.pattern('.*[\\S]+.*'),
    ]);
  }

  onAdd(): void {
    this.loading = true;
    let owner: number;
    let specificUser: number;

    if (this.isService) {
      owner = this.selection.selected[0].id;
      specificUser = this.userId;
    } else {
      owner = this.userId;
      specificUser = this.selection.selected[0].id;
    }

    this.userManager.addSpecificUserOwner(owner, specificUser).subscribe(() => {
      this.notificator.showSuccess(
        this.translate.instant('DIALOGS.CONNECT_IDENTITY.SUCCESS') as string
      );
      this.dialogRef.close(true);
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSearchByString(): void {
    if (this.searchCtrl.invalid) {
      this.searchCtrl.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.firstSearchDone = true;
    let attributes = [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL];
    attributes = attributes.concat(this.storeService.getLoginAttributeNames());
    this.userManager
      .findRichUsersWithAttributes(this.searchCtrl.value as string, attributes)
      .subscribe(
        (identities) => {
          this.identities = this.filterIdentities(identities);
          this.loading = false;
        },
        () => {
          this.loading = false;
        }
      );
  }

  onKeyInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearchByString();
    }
  }

  private filterIdentities(identities: RichUser[]): RichUser[] {
    if (this.isService) {
      return identities.filter((identity) => !identity.serviceUser);
    }

    return identities.filter((identity) => identity.serviceUser);
  }
}
