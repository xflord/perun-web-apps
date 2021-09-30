import { Component, OnInit } from '@angular/core';
import { InitAuthService, StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.css'],
})
export class MainWindowComponent implements OnInit {
  unknownIdentity: boolean;

  constructor(private storeService: StoreService, private initService: InitAuthService) {}

  ngOnInit(): void {
    void this.initService.simpleLoadPrincipal().then(() => {
      this.unknownIdentity = this.storeService.getPerunPrincipal().userId === -1;
    });
  }
}
