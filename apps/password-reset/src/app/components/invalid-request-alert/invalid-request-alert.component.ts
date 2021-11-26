import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-invalid-request-alert',
  templateUrl: './invalid-request-alert.component.html',
  styleUrls: ['./invalid-request-alert.component.scss']
})
export class InvalidRequestAlertComponent implements OnInit {

  constructor(private translate: TranslateService) { }

  invalidRequestMessage: string;

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      this.invalidRequestMessage = this.translate.instant('PAGES.PWD_RESET_PAGE.INVALID_REQUEST');
    });
  }

}
