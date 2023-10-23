import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TABLE_AUDIT_MESSAGES } from '@perun-web-apps/config/table-config';
import { AuditMessagesManagerService } from '@perun-web-apps/perun/openapi';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-admin-audit-log',
  templateUrl: './admin-audit-log.component.html',
  styleUrls: ['./admin-audit-log.component.scss'],
})
export class AdminAuditLogComponent implements OnInit {
  tableId = TABLE_AUDIT_MESSAGES;
  refresh = false;
  loading$: Observable<boolean>;

  selectedEvents: string[] = [];
  eventOptions: string[] = [];
  eventOptionsForSearchSelect: string[] = [];

  constructor(
    private auditMessagesManagerService: AuditMessagesManagerService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading$ = of(true);
    this.auditMessagesManagerService.findAllPossibleEvents().subscribe((res) => {
      this.eventOptions = res.sort();
      this.eventOptionsForSearchSelect = this.eventOptions;
    });
  }

  refreshTable(): void {
    this.refresh = !this.refresh;
    this.cd.detectChanges();
  }

  toggleEvent(events: string[]): void {
    // Replace array in-place so it won't trigger ngOnChanges
    this.selectedEvents.splice(0, this.selectedEvents.length, ...events);
  }

  refreshOnClosed(): void {
    this.selectedEvents = [...this.selectedEvents];
    const otherEntities = this.eventOptions.filter((e) => !this.selectedEvents.includes(e));
    this.eventOptionsForSearchSelect = [...this.selectedEvents, ...otherEntities];
    this.cd.detectChanges();
  }
}
