import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-table-options',
  templateUrl: './table-options.component.html',
  styleUrls: ['./table-options.component.scss'],
})
export class TableOptionsComponent {
  @Output() exportData = new EventEmitter<string>();
}
