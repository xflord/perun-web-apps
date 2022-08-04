import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-immediate-filter',
  templateUrl: './immediate-filter.component.html',
  styleUrls: ['./immediate-filter.component.scss'],
})
export class ImmediateFilterComponent implements OnInit {
  @Input() placeholder: string;
  @Output() filter = new EventEmitter<string>();
  @Input() autoFocus = false;

  formControl = new UntypedFormControl();

  ngOnInit(): void {
    this.formControl.valueChanges.subscribe((value: string) => {
      let returnValue = value.trim();
      returnValue = returnValue.toLowerCase();
      this.filter.emit(returnValue);
    });
  }
}
