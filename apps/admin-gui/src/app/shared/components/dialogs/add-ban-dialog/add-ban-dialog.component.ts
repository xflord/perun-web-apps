import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BanSpecificationComponent } from '@perun-web-apps/perun/components';
import { Ban } from '@perun-web-apps/perun/openapi';

export interface BanForm {
  description: string;
  validity: string;
}

export interface AddBanData<T extends Ban> {
  entityId: number;
  theme: string;
  bans: T[];
}

@Component({
  selector: 'app-add-ban-dialog',
  templateUrl: './add-ban-dialog.component.html',
  styleUrls: ['./add-ban-dialog.component.scss'],
})
export class AddBanDialogComponent<T extends Ban> {
  @Input() loading = false;
  @Input() disabled = false;
  @Input() theme: string;
  @Input() ban: T;
  @Output() add = new EventEmitter<BanForm>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild(BanSpecificationComponent) banForm: BanSpecificationComponent;

  addBan(): void {
    this.add.emit({
      description: this.banForm.getDescription(),
      validity: this.banForm.getValidity(),
    });
  }
}
