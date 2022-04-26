import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Vo } from '@perun-web-apps/perun/openapi';
import { compareFnName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-vo-search-select',
  templateUrl: './vo-search-select.component.html',
  styleUrls: ['./vo-search-select.component.css'],
})
export class VoSearchSelectComponent implements OnChanges {
  constructor() {}

  @Input()
  vo: Vo;

  @Input()
  vos: Vo[];

  @Output()
  voSelected = new EventEmitter<Vo>();

  nameFunction = (vo: Vo) => vo.name;
  shortNameFunction = (vo: Vo) => vo.shortName;
  searchFunction = (vo: Vo) => vo.name + vo.shortName + vo.id;

  ngOnChanges() {
    this.vos.sort(compareFnName);
    if (!this.vo) {
      this.vo = this.vos[0];
    }
  }
}
