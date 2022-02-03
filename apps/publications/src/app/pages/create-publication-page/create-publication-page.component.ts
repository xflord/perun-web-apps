import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-create-publication-page',
  templateUrl: './create-publication-page.component.html',
  styleUrls: ['./create-publication-page.component.scss'],
})
export class CreatePublicationPageComponent {
  constructor(private router: Router) {}

  importPublications() {
    this.router.navigate(['create-publication', 'import']);
  }

  createPublication() {
    this.router.navigate(['create-publication', 'create']);
  }
}
