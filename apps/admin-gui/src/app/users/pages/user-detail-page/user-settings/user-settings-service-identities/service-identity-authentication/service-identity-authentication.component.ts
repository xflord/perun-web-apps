import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-service-identity-authentication',
  templateUrl: './service-identity-authentication.component.html',
  styleUrls: ['./service-identity-authentication.component.scss'],
})
export class ServiceIdentityAuthenticationComponent {
  @HostBinding('class.router-component') true;
}
