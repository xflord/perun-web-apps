import { Component, Input } from '@angular/core';
import { Group } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-authorized-groups-cell',
  templateUrl: 'authorized-groups-cell.component.html',
  styleUrls: ['authorized-groups-cell.component.scss'],
})
export class AuthorizedGroupsCellComponent {
  @Input() groups: Group[];
  @Input() authzVoNames: Map<number, string>;
  @Input() disableRouting = false;
  defaultItemsShown = 3;
  itemsShown = this.defaultItemsShown;
  showMore = false;
  onShowChange(): void {
    this.showMore = !this.showMore;

    this.setItemsShown();
  }

  private setItemsShown(): void {
    if (this.showMore) {
      this.itemsShown = this.groups.length;
    } else {
      this.itemsShown = this.defaultItemsShown;
    }
  }
}
