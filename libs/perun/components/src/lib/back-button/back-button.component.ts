import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
})
export class BackButtonComponent implements OnInit {
  backButtonColor: string;

  constructor(private location: Location, private storeService: StoreService) {}

  ngOnInit(): void {
    this.backButtonColor = this.storeService.get('theme', 'back_button_color') as string;
  }

  goBack(): void {
    if (sessionStorage.getItem('onInitPage') === 'false') {
      this.location.back();
    }
  }
}
