import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-statistics-card',
  templateUrl: './statistics-card.component.html',
  styleUrls: ['./statistics-card.component.scss'],
})
export class StatisticsCardComponent implements OnInit {
  @Input()
  rowNames: string[] = [];
  @Input()
  title = '';
  @Input()
  statistics: Map<string, number> = new Map<string, number>();
  dataSource: MatTableDataSource<string> = null;
  displayedColumns = ['name', 'value'];

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<string>(this.rowNames);
  }
}
