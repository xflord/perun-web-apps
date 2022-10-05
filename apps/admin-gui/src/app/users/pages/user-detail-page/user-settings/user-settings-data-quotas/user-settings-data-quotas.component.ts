import { Component, OnInit } from '@angular/core';
import { User } from '@perun-web-apps/perun/openapi';
import { EntityStorageService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-perun-web-apps-user-settings-data-quotas',
  templateUrl: './user-settings-data-quotas.component.html',
  styleUrls: ['./user-settings-data-quotas.component.scss'],
})
export class UserSettingsDataQuotasComponent implements OnInit {
  user: User;

  constructor(private entityStorageService: EntityStorageService) {}

  ngOnInit(): void {
    this.user = this.entityStorageService.getEntity();
  }
}
