import { Component, HostBinding } from '@angular/core';
import { fadeIn } from '@perun-web-apps/perun/animations';

@Component({
  selector: 'app-facility-settings',
  templateUrl: './facility-settings.component.html',
  styleUrls: ['./facility-settings.component.scss'],
  animations: [fadeIn],
})
export class FacilitySettingsComponent {
  @HostBinding('class.router-component') true;
}
