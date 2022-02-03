import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuditMessage } from '@perun-web-apps/perun/openapi';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatTabChangeEvent } from '@angular/material/tabs';

export interface AuditMessageDetailDialogData {
  message: AuditMessage;
}

@Component({
  selector: 'app-audit-message-detail-dialog',
  templateUrl: './audit-message-detail-dialog.component.html',
  styleUrls: ['./audit-message-detail-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AuditMessageDetailDialogComponent implements OnInit {
  title;
  actor;
  createdAt;
  message;
  tabIndex = 0;
  eventData = {};

  constructor(
    public dialogRef: MatDialogRef<AuditMessageDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AuditMessageDetailDialogData,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    const eventData = this.data.message.event;
    this.actor = this.data.message.actor;
    this.createdAt = this.data.message.createdAt;
    if (eventData.message) {
      this.message = eventData.message;
      delete eventData.message;
    }
    if (eventData.name) {
      this.title = eventData.name;
      delete eventData.name;
    }
    this.eventData = eventData;
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.tabIndex = tabChangeEvent.index;
  }

  copyObjects() {
    this.clipboard.copy(JSON.stringify(this.eventData, null, 2));
  }

  copyMessage() {
    this.clipboard.copy(this.message);
  }

  syntaxHighlight(json) {
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  onClose() {
    this.dialogRef.close();
  }
}
