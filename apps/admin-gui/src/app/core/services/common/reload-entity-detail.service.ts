import { EventEmitter, Injectable, Output } from '@angular/core';
import { EntityStorageService } from '@perun-web-apps/perun/services';

@Injectable({
  providedIn: 'root'
})
export class ReloadEntityDetailService {

  constructor(private entityStorageService: EntityStorageService,) { }

  @Output() groupDetailChange: EventEmitter<void> = new EventEmitter();
  @Output() voDetailChange: EventEmitter<void> = new EventEmitter();
  @Output() resourceDetailChange: EventEmitter<void> = new EventEmitter();
  @Output() facilityDetailChange: EventEmitter<void> = new EventEmitter();

  reloadGroupDetail(): void {
    this.groupDetailChange.emit();
  }

  reloadFacilityDetail(): void {
    this.facilityDetailChange.emit();
  }

  reloadResourceDetail(): void {
    this.resourceDetailChange.emit();
  }

  reloadVoDetail(): void {
    this.voDetailChange.emit();
  }

  reloadEntityDetail(): void {
    const entity = this.entityStorageService.getEntity();
    switch (entity.beanName) {
      case 'Group':
        this.reloadGroupDetail();
        break;
      case 'Facility':
        this.reloadFacilityDetail();
        break;
      case 'Vo':
        this.reloadVoDetail();
        break;
      case 'Resource':
        this.reloadResourceDetail();
        break;
    }
  }
}
