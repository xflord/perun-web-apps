import { Component, Input, OnInit } from '@angular/core';
import { ExpandableSectionId, MenuItem } from '@perun-web-apps/perun/models';
import { ExpandedTilesStoreService } from '@perun-web-apps/perun/services';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'perun-web-apps-expandable-tiles',
  templateUrl: './expandable-tiles.component.html',
  styleUrls: ['./expandable-tiles.component.scss'],
})
export class ExpandableTilesComponent implements OnInit {
  @Input() items: MenuItem[];
  @Input() title: string;
  @Input() sectionId: ExpandableSectionId;
  expanded: Observable<boolean>;

  constructor(private expandedTilesStore: ExpandedTilesStoreService) {}

  ngOnInit(): void {
    this.expanded = this.expandedTilesStore.getStates().pipe(
      switchMap((states) => {
        return of(states.get(this.sectionId));
      }),
    );
  }

  toggle(): void {
    this.expandedTilesStore.setItem(this.sectionId);
  }
}
