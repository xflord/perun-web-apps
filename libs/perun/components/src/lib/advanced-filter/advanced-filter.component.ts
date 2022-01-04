import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'perun-web-apps-advanced-filter',
  templateUrl: './advanced-filter.component.html',
  styleUrls: ['./advanced-filter.component.scss']
})
export class AdvancedFilterComponent implements OnInit {

  constructor() { }

  @Input()
  filtersCount;

  @Input()
  advancedFilter: boolean;
  @Output()
  changeAdvancedFilter: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  clearFilters: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void {
    this.changeAdvancedFilter.emit(this.advancedFilter);
  }

  toggleAdvancedFilter() {
    this.advancedFilter = !this.advancedFilter;
    this.changeAdvancedFilter.emit(this.advancedFilter);
  }
}
