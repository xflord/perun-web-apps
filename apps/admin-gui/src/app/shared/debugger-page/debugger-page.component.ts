import { Component, OnInit } from '@angular/core';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';
import { PerunPrincipal } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-debugger-page',
  templateUrl: './debugger-page.component.html',
  styleUrls: ['./debugger-page.component.scss'],
})
export class DebuggerPageComponent implements OnInit {
  principal: PerunPrincipal;

  constructor(public authResolver: GuiAuthResolver, private store: StoreService) {}

  ngOnInit(): void {
    this.principal = this.store.getPerunPrincipal();
  }
}
