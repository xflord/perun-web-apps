import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-edit-application-form-item-line',
  templateUrl: './edit-application-form-item-line.component.html',
  styleUrls: ['./edit-application-form-item-line.component.css'],
})
export class EditApplicationFormItemLineComponent {
  @Input()
  label: string;

  @Input()
  description: string;
}
