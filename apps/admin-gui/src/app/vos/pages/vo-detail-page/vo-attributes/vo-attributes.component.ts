import { Component, HostBinding, OnInit } from '@angular/core';
import { EntityStorageService } from '@perun-web-apps/perun/services';
import { Vo } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-vo-attributes',
  templateUrl: './vo-attributes.component.html',
  styleUrls: ['./vo-attributes.component.scss'],
})
export class VoAttributesComponent implements OnInit {
  @HostBinding('class.router-component') true;
  vo: Vo;

  constructor(private entityStorageService: EntityStorageService) {}

  ngOnInit(): void {
    this.vo = this.entityStorageService.getEntity();
  }
}
