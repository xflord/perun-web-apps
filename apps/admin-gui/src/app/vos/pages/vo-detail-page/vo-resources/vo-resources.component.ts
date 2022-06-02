import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fadeIn } from '@perun-web-apps/perun/animations';

@Component({
  selector: 'app-vo-resources',
  templateUrl: './vo-resources.component.html',
  styleUrls: ['./vo-resources.component.scss'],
  animations: [fadeIn],
})
export class VoResourcesComponent implements OnInit {
  @HostBinding('class.router-component') true;

  voId: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.parent.params.subscribe((parentParams) => {
      this.voId = Number(parentParams['voId']);
    });
  }
}
