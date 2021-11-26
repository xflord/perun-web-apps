import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-password-reset-page',
  templateUrl: './password-reset-page.component.html',
  styleUrls: ['./password-reset-page.component.scss']
})

export class PasswordResetPageComponent implements OnInit {

  constructor(private storeService: StoreService,
              private sanitizer: DomSanitizer) { }

  @Input()
  mode: string;

  @Input()
  token: string;

  @Input()
  namespace: string;

  @Input()
  login: string;

  @Input()
  validToken: boolean;

  @Input()
  authWithoutToken: boolean;

  passwordResetLogo: any;

  ngOnInit(): void {
    this.passwordResetLogo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('password_reset_logo'));
  }

}
