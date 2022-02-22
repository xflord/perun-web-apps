import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'perun-web-apps-menu-buttons-field',
  templateUrl: './menu-buttons-field.component.html',
  styleUrls: ['./menu-buttons-field.component.scss'],
})
export class MenuButtonsFieldComponent implements OnInit {
  @Input() items: MenuItem[];
  @Input() size = 'large';
  voId: number;
  constructor(public dialog: MatDialog, protected route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.voId = Number(params['voId']);
    });
  }
}
