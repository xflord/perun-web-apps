import { Component, HostBinding } from '@angular/core';
import { fadeIn } from '@perun-web-apps/perun/animations';

@Component({
  selector: 'app-group-settings',
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss'],
  animations: [fadeIn],
})
export class GroupSettingsComponent {
  @HostBinding('class.router-component') true;
}
