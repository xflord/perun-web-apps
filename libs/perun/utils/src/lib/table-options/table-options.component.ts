import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-table-options',
  templateUrl: './table-options.component.html',
  styleUrls: ['./table-options.component.scss'],
})
export class TableOptionsComponent {
  @Input() allowExportAll: boolean;
  @Output() exportDisplayedData = new EventEmitter<string>();
  @Output() exportAllData = new EventEmitter<string>();
}
