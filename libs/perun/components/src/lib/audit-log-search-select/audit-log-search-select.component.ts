import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-audit-log-search-select',
  templateUrl: './audit-log-search-select.component.html',
  styleUrls: ['./audit-log-search-select.component.scss'],
})
export class AuditLogSearchSelectComponent {
  @Input() auditLogs: string[];
  @Input() disableDeselectButton = true;
  @Output() auditLogsSelected = new EventEmitter<string[]>();
  @Output() selectClosed = new EventEmitter<boolean>();

  searchFunction = (entity: string): string => entity;
  mainTextFunction = (entity: string): string => entity;
  secondaryTextFunction = (): string => '';
}
