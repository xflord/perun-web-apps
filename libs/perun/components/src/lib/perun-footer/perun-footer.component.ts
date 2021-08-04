import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportIssueDialogComponent } from '../report-issue-dialog/report-issue-dialog.component';
import { StoreService } from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { TranslateService } from '@ngx-translate/core';
declare let require: any;

@Component({
  selector: 'perun-web-apps-footer',
  templateUrl: './perun-footer.component.html',
  styleUrls: ['./perun-footer.component.scss']
})
export class PerunFooterComponent implements OnInit {

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
  language = 'en';

  @Output()
  footerHeight = new EventEmitter<number>();

  constructor(private storeService:StoreService,
              private translateService: TranslateService,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.translateService.onLangChange.subscribe(lang => {
      this.language = lang.lang
    });
    this.version = require( '../../../../../../package.json').version;
    this.items = this.storeService.get('footer', 'columns');
    this.copyrightItems = this.storeService.get('footer', 'copyright_items');
    this.getHeight()
  }

  openDialog(name: string) {
    const config = getDefaultDialogConfig();
    switch (name){
      case 'reportIssue':
        config.width = '550px';
        this.dialog.open(ReportIssueDialogComponent, config);
    }
  }

  private getHeight() {
    let longestColumn = 1;
    for (const col of this.items) {
      longestColumn = longestColumn < col.elements.length ?  col.elements.length : longestColumn;
    }
    this.footerHeight.emit(35 + 26 + 25*longestColumn+ 16 + 1 + 20);
  }
}
