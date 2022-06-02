import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { fadeIn } from '@perun-web-apps/perun/animations';

@Component({
  selector: 'app-vo-settings',
  templateUrl: './vo-settings.component.html',
  styleUrls: ['./vo-settings.component.scss'],
  animations: [fadeIn],
})
export class VoSettingsComponent implements OnInit {
  @HostBinding('class.router-component') true;
  voId: number;
  private backButtonRegex = new RegExp('/organizations/\\d+/settings/\\w+$');
  private currentUrl: string;
  private backButtonDisplayed = false;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.currentUrl = router.url;
    this.backButtonDisplayed = this.backButtonRegex.test(this.currentUrl);

    router.events.subscribe((_: NavigationEnd) => {
      if (_ instanceof NavigationEnd) {
        this.currentUrl = _.url;

        this.backButtonDisplayed = this.backButtonRegex.test(this.currentUrl);
      }
    });
  }

  ngOnInit(): void {
    this.route.parent.params.subscribe((parentParams) => {
      this.voId = Number(parentParams['voId']);
    });
  }
}
