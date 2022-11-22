import { Component, OnInit } from '@angular/core';
import { TABLE_AUDIT_MESSAGES } from '@perun-web-apps/config/table-config';
import { AuditMessagesManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-admin-audit-log',
  templateUrl: './admin-audit-log.component.html',
  styleUrls: ['./admin-audit-log.component.scss'],
})
export class AdminAuditLogComponent implements OnInit {
  tableId = TABLE_AUDIT_MESSAGES;
  refresh = false;

  selectedEvents: string[] = [];
  eventOptions: string[] = [];

  constructor(private auditMessagesManagerService: AuditMessagesManagerService) {}

  ngOnInit(): void {
    this.auditMessagesManagerService.findAllPossibleEvents().subscribe((res) => {
      this.eventOptions = res.sort();
    });
  }

  refreshTable(): void {
    this.refresh = !this.refresh;
  }

  toggleEvent(events: string[]): void {
    // Replace array in-place so it won't trigger ngOnChanges
    this.selectedEvents.splice(0, this.selectedEvents.length, ...events);
  }

  refreshOnClosed(): void {
    this.selectedEvents = [...this.selectedEvents];
  }
}
