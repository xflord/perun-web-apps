import { Component, OnInit } from '@angular/core';
import { FacilitiesManagerService, Host } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-facility-hosts-detail',
  templateUrl: './facility-hosts-detail.component.html',
  styleUrls: ['./facility-hosts-detail.component.scss'],
})
export class FacilityHostsDetailComponent implements OnInit {
  hostId: number;
  host: Host = { beanName: '', id: 0 };

  constructor(private facilityManager: FacilitiesManagerService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.hostId = Number(params['hostId']);
      this.facilityManager.getHostById(this.hostId).subscribe((host) => {
        this.host = host;
      });
    });
  }
}
