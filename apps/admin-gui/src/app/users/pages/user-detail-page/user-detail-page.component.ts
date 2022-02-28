import { Component } from '@angular/core';
import { fadeIn } from '@perun-web-apps/perun/animations';

@Component({
  selector: 'app-user-detail-page',
  templateUrl: './user-detail-page.component.html',
  styleUrls: ['./user-detail-page.component.scss'],
  animations: [fadeIn],
})
export class UserDetailPageComponent {}
