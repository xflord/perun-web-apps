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
import { UtilsService } from '@perun-web-apps/perun/openapi';
import { CopyrightItem, FooterColumn } from '@perun-web-apps/perun/models';
declare let require: any;

@Component({
  selector: 'perun-web-apps-footer',
  templateUrl: './perun-footer.component.html',
  styleUrls: ['./perun-footer.component.scss'],
})
export class PerunFooterComponent implements OnInit {
  copyrightTextColor: string = this.storeService.getProperty('theme').footer_copyright_text_color;

  footerColumns: FooterColumn[] = [];
  copyrightItems: CopyrightItem[] = [];
  currentYear: number = new Date().getFullYear();
  containsLogos = false;
  headersTextColor: string = this.storeService.getProperty('theme').footer_headers_text_color;
  linksTextColor: string = this.storeService.getProperty('theme').footer_links_text_color;
  githubRepository: string = this.storeService.getProperty('footer').github_releases;
  githubBackendRepository: string = this.storeService.getProperty('footer').github_backend_releases;
  bgColor: string = this.storeService.getProperty('theme').footer_bg_color;
  version = '';
  backendVersion = '';
  guiVersion = '';
  language = 'en';
  columnContentHeight = 0;

  constructor(
    private storeService: StoreService,
    private translateService: TranslateService,
    private utilsService: UtilsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.translateService.onLangChange.subscribe((lang) => {
      this.language = lang.lang;
    });
    this.version = require('../../../../../../package.json').version as string;
    this.footerColumns = this.storeService.getProperty('footer').columns;

    this.guiVersion = require('../../../../../../package.json').version as string;
    this.utilsService.getPerunStatus().subscribe((val) => {
      const versionString = val[0];
      this.backendVersion = versionString.substring(versionString.indexOf(':') + 2);
    });

    this.footerColumns = this.storeService.getProperty('footer').columns;
    for (const col of this.footerColumns) {
      if (col.logos) {
        this.containsLogos = true;
      } else if (col.elements.length * 25 > this.columnContentHeight) {
        this.columnContentHeight = col.elements.length * 25;
      }
    }
    this.copyrightItems = this.storeService.getProperty('footer').copyrightItems;
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
