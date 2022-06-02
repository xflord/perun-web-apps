import { Component, OnInit } from '@angular/core';
import { RichResource, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_ADMIN_USER_RESOURCES_LIST } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-perun-web-apps-user-resources',
  templateUrl: './user-resources.component.html',
  styleUrls: ['./user-resources.component.scss'],
})
export class UserResourcesComponent implements OnInit {
  resources: RichResource[] = [];
  loading: boolean;
  tableId = TABLE_ADMIN_USER_RESOURCES_LIST;
  filterValue = '';

  constructor(private userManager: UsersManagerService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.refreshTable();
  }

  refreshTable(): void {
    this.loading = true;
    this.route.parent.params.subscribe((parentParams) => {
      const userId = Number(parentParams['userId']);
      this.userManager.getAssignedRichResourcesForUser(userId).subscribe((richResources) => {
        this.resources = richResources;
        this.loading = false;
      });
    });
  }

  resourceFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }
}
