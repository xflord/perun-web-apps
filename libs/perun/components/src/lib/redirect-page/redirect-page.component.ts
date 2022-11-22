import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ForceRouterService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-redirect-page',
  templateUrl: './redirect-page.component.html',
  styleUrls: ['./redirect-page.component.css'],
})
export class RedirectPageComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private forceRoute: ForceRouterService
  ) {}

  ngOnInit(): void {
    if (this.forceRoute.getLastState() === 'back') {
      this.location.back();
      return;
    }

    this.route.queryParams.subscribe((params) => {
      const newParams = Object.assign({}, params);
      // preserve all previous params excluding temporary params redirectTo and applicationFormItems (application preview)
      delete newParams.redirectTo;
      delete newParams.applicationFormItems;
      void this.router.navigate([params.redirectTo], {
        queryParams: newParams,
        // we don't want to merge or preserve old queryParams here!
        queryParamsHandling: '',
      });
    });
  }
}
