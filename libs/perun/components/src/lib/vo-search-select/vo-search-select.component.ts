import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Vo } from '@perun-web-apps/perun/openapi';
import { compareFnName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-vo-search-select',
  templateUrl: './vo-search-select.component.html',
  styleUrls: ['./vo-search-select.component.css'],
})
export class VoSearchSelectComponent implements OnChanges {
  @Input() vo: Vo;
  @Input() vos: Vo[];
  @Output() voSelected = new EventEmitter<Vo>();

  nameFunction = (vo: Vo): string => vo.name;
  shortNameFunction = (vo: Vo): string => vo.shortName;
  searchFunction = (vo: Vo): string => vo.name + vo.shortName + String(vo.id);

  ngOnChanges(): void {
    this.vos.sort(compareFnName);
    if (!this.vo) {
      this.vo = this.vos[0];
    }
  }
}
