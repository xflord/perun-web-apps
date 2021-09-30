import { Component } from '@angular/core';
import { InitAuthService, StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  contentBackgroundColor = this.store.getProperty('theme').content_bg_color;
  isLoginScreenShow = this.initAuth.isLoginScreenShown();

  constructor(private store: StoreService, private initAuth: InitAuthService) {}
}
