import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReloadEntityDetailService {
  @Output() entityDetailChange: EventEmitter<void> = new EventEmitter<void>();

  reloadEntityDetail(): void {
    this.entityDetailChange.emit();
  }
}
