import { Component, OnInit } from '@angular/core';
import { User } from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-settings-mailing-lists',
  templateUrl: './settings-mailing-lists.component.html',
  styleUrls: ['./settings-mailing-lists.component.scss'],
})
export class SettingsMailingListsComponent implements OnInit {
  user: User;

  constructor(private store: StoreService) {}

  ngOnInit(): void {
    this.user = this.store.getPerunPrincipal().user;
  }
}
