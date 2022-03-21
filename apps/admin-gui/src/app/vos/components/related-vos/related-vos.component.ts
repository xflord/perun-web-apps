import { Component, Input } from '@angular/core';
import { Vo } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-related-vos',
  templateUrl: './related-vos.component.html',
  styleUrls: ['./related-vos.component.scss'],
})
export class RelatedVosComponent {
  @Input() title: string;
  @Input() vos: Vo[] = [];
}
