import { Component, Input } from '@angular/core';

@Component({
  selector: 'perun-web-apps-recently-viewed-icon',
  templateUrl: './recently-viewed-icon.component.html',
  styleUrls: ['./recently-viewed-icon.component.css'],
})
export class RecentlyViewedIconComponent {
  @Input() recentIds: number[] = [];
  @Input() id: number;
}
