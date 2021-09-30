import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LinkerResult } from '@perun-web-apps/lib-linker';

@Component({
  selector: 'perun-web-apps-show-result-page',
  templateUrl: './show-result-page.component.html',
  styleUrls: ['./show-result-page.component.css'],
})
export class ShowResultPageComponent implements OnInit {
  linkerResult: LinkerResult;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.linkerResult = params['result'] as LinkerResult;
    });
  }

  onClick(): void {
    void this.router.navigate(['/consolidate'], {
      queryParamsHandling: 'merge',
    });
  }
}
