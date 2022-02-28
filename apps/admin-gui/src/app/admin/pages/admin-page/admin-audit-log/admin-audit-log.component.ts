import { Component } from '@angular/core';
import { TABLE_AUDIT_MESSAGES } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-admin-audit-log',
  templateUrl: './admin-audit-log.component.html',
  styleUrls: ['./admin-audit-log.component.scss'],
})
export class AdminAuditLogComponent {
  tableId = TABLE_AUDIT_MESSAGES;
  refresh = false;

  refreshTable(): void {
    this.refresh = !this.refresh;
  }
}
