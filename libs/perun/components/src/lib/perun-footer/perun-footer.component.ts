/* eslint-disable
   @typescript-eslint/no-explicit-any,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-call */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportIssueDialogComponent } from '../report-issue-dialog/report-issue-dialog.component';
import { StoreService } from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { TranslateService } from '@ngx-translate/core';
import { TranslatedElem } from '@perun-web-apps/perun/pipes';
declare let require: any;

interface FooterElement extends TranslatedElem {
  logo?: string;
  icon?: string;
  dialog?: string;
  link_en: string;
}

interface FooterColumn extends TranslatedElem {
  elements: FooterElement[];
  logos: string[];
}

interface FooterCopyrightItems {
  name: string;
  url: string;
}

@Component({
  selector: 'perun-web-apps-footer',
  templateUrl: './perun-footer.component.html',
  styleUrls: ['./perun-footer.component.scss'],
})
export class PerunFooterComponent implements OnInit {
  copyrightTextColor: string = this.storeService.get(
    'theme',
    'footer_copyright_text_color'
  ) as string;

  footerColumns: FooterColumn[] = [];
  copyrightItems: FooterCopyrightItems[] = [];
  currentYear: number = new Date().getFullYear();
  containsLogos = false;
  headersTextColor: string = this.storeService.get('theme', 'footer_headers_text_color') as string;
  linksTextColor: string = this.storeService.get('theme', 'footer_links_text_color') as string;
  githubRepository: string = this.storeService.get('footer', 'github_releases') as string;
  iconColor: string = this.storeService.get('theme', 'footer_icon_color') as string;
  bgColor: string = this.storeService.get('theme', 'footer_bg_color') as string;
  version = '';
  language = 'en';
  columnContentHeight = 0;

  constructor(
    private storeService: StoreService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.translateService.onLangChange.subscribe((lang) => {
      this.language = lang.lang;
    });
    this.version = require('../../../../../../package.json').version as string;
    this.footerColumns = this.storeService.get('footer', 'columns') as FooterColumn[];
    for (const col of this.footerColumns) {
      if (col.logos) {
        this.containsLogos = true;
      } else if (col.elements.length * 25 > this.columnContentHeight) {
        this.columnContentHeight = col.elements.length * 25;
      }
    }
    this.copyrightItems = this.storeService.get(
      'footer',
      'copyright_items'
    ) as FooterCopyrightItems[];
  }

  openDialog(name: string): void {
    const config = getDefaultDialogConfig();
    switch (name) {
      case 'reportIssue':
        config.width = '550px';
        this.dialog.open(ReportIssueDialogComponent, config);
    }
  }
}
