import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReloadEntityDetailService {

  constructor() { }

  @Output() entityDetailChange: EventEmitter<void> = new EventEmitter();


  reloadEntityDetail(): void {
    this.entityDetailChange.emit();
  }
}
