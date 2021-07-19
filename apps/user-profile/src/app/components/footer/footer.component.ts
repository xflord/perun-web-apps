import { Component, OnInit } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ReportIssueDialogComponent } from '../../../../../../libs/perun/components/src/lib/report-issue-dialog/report-issue-dialog.component';
import { MatDialog } from '@angular/material/dialog';
declare var require: any;

@Component({
  selector: 'perun-web-apps-footer-user-profile',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  copyrightTextColor = this.storeService.get('theme', 'footer_copyright_text_color');

  items = [];
  copyrightItems = [];
  currentYear = (new Date()).getFullYear();

  headersTextColor = this.storeService.get('theme', 'footer_headers_text_color');
  linksTextColor = this.storeService.get('theme', 'footer_links_text_color');
  githubRepository = this.storeService.get('footer', 'github_releases');
  iconColor = this.storeService.get('theme', 'footer_icon_color');
  bgColor = this.storeService.get('theme', 'footer_bg_color');
  version = '';

  constructor(private storeService:StoreService,
              private translateService: TranslateService,
              private dialog: MatDialog) { }

  language = 'en';

  ngOnInit() {
    this.translateService.onLangChange.subscribe(lang => {
      this.language = lang.lang
    });
    this.version = require( '../../../../../../package.json').version;
    this.items = this.storeService.get('footer', 'columns');
    this.copyrightItems = this.storeService.get('footer', 'copyright_items');
  }

  openDialog(name: string) {
    const config = getDefaultDialogConfig();
    switch (name){
      case 'reportIssue':
        config.width = '550px';
        this.dialog.open(ReportIssueDialogComponent, config);
    }
  }
}
