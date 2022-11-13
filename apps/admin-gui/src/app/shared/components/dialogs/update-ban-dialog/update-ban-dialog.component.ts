import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Ban } from '@perun-web-apps/perun/openapi';
import { BanForm } from '../add-ban-dialog/add-ban-dialog.component';
import { BanSpecificationComponent } from '@perun-web-apps/perun/components';

export interface UpdateBanData<T extends Ban> {
  ban: T;
  theme: string;
}

@Component({
  selector: 'app-update-ban-dialog',
  templateUrl: './update-ban-dialog.component.html',
  styleUrls: ['./update-ban-dialog.component.scss'],
})
export class UpdateBanDialogComponent {
  @Input() loading = false;
  @Input() ban: Ban;
  @Input() theme: string;
  @Output() cancel = new EventEmitter<void>();
  @Output() update = new EventEmitter<BanForm>();
  @ViewChild(BanSpecificationComponent) banForm: BanSpecificationComponent;

  updateBan(): void {
    this.update.emit({
      description: this.banForm.getDescription(),
      validity: this.banForm.getValidity(),
    });
  }
}
