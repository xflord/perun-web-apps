import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';

// This date (1. Jan 2999) is set by backend as a 'never' expire option
export const BAN_EXPIRATION_NEVER = new Date(32472140400000).valueOf();

@Component({
  selector: 'perun-web-apps-ban-specification',
  templateUrl: './ban-specification.component.html',
  styleUrls: ['./ban-specification.component.scss'],
})
export class BanSpecificationComponent {
  minDate = new Date();
  validityControl = new FormControl<string>(null);
  descriptionControl = new FormControl<string>('');
  newValidity: string;

  @Input() set validity(validity: string) {
    this.newValidity =
      validity && Number(new Date(validity)) !== BAN_EXPIRATION_NEVER
        ? this.parseDate(validity)
        : 'never';
    if (this.newValidity !== 'never') {
      this.validityControl.setValue(this.newValidity);
    } else {
      this.validityControl.setValue(this.parseDate(new Date()));
    }
  }

  @Input() set description(description: string) {
    this.descriptionControl.setValue(description);
  }

  getDescription(): string {
    return this.descriptionControl.value;
  }

  getValidity(): string {
    if (this.newValidity === 'never' || !this.validityControl.value) return null;
    return this.parseDate(this.validityControl.value);
  }

  private parseDate(date: Date | string): string {
    return formatDate(date, 'yyyy-MM-dd', 'en');
  }
}
