import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FacilitiesManagerService,
  Facility,
  Member,
  Resource,
} from '@perun-web-apps/perun/openapi';
import { compareFnName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-perun-web-apps-user-assignments',
  templateUrl: './user-assignments.component.html',
  styleUrls: ['./user-assignments.component.scss'],
})
export class UserAssignmentsComponent implements OnInit {
  initLoading = true;
  loading = false;
  facilities: Facility[] = [];
  selectedFacility: Facility = null;
  member: Member = null;
  resources: Resource[] = [];
  userId: number;
  constructor(private route: ActivatedRoute, private facilityService: FacilitiesManagerService) {}

  ngOnInit(): void {
    this.initLoading = true;
    this.route.parent.params.subscribe((params) => {
      this.userId = Number(params['userId']);
      this.facilityService.getAssignedFacilitiesByUser(this.userId).subscribe({
        next: (facilities) => {
          this.facilities = facilities;
          if (this.facilities.length) {
            this.loadFacility(this.facilities.sort(compareFnName)[0]);
          }
          this.initLoading = false;
        },
        error: () => (this.initLoading = false),
      });
    });
  }

  loadFacility(facility: Facility): void {
    this.loading = true;
    this.selectedFacility = facility;
    this.facilityService.getAssignedRichResourcesForFacility(facility.id).subscribe({
      next: (resources) => {
        this.resources = resources;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
