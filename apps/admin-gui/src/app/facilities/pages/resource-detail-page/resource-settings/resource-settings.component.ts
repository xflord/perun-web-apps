import { Component, HostBinding } from '@angular/core';
import { fadeIn } from '@perun-web-apps/perun/animations';

@Component({
  selector: 'app-resource-settings',
  templateUrl: './resource-settings.component.html',
  styleUrls: ['./resource-settings.component.scss'],
  animations: [fadeIn],
})
export class ResourceSettingsComponent {
  @HostBinding('class.router-component') true;
}
