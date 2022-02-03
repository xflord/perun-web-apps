import { EventEmitter, Injectable, Output } from '@angular/core';
import { SideMenuItem } from '../../../shared/side-menu/side-menu.component';

@Injectable({
  providedIn: 'root',
})
export class SideMenuService {
  constructor() {}

  @Output() accessItemsChange: EventEmitter<SideMenuItem[]> = new EventEmitter();
  @Output() facilityItemsChange: EventEmitter<SideMenuItem[]> = new EventEmitter();
  @Output() adminItemsChange: EventEmitter<SideMenuItem[]> = new EventEmitter();
  @Output() userItemsChange: EventEmitter<SideMenuItem[]> = new EventEmitter();
  @Output() resetChange: EventEmitter<void> = new EventEmitter();
  @Output() homeItemsChange: EventEmitter<SideMenuItem[]> = new EventEmitter();

  setHomeItems(items: SideMenuItem[]): void {
    this.homeItemsChange.emit(items);
  }

  setAccessMenuItems(items: SideMenuItem[]): void {
    this.accessItemsChange.emit(items);
  }

  setFacilityMenuItems(items: SideMenuItem[]): void {
    this.facilityItemsChange.emit(items);
  }

  setAdminItems(items: SideMenuItem[]): void {
    this.adminItemsChange.emit(items);
  }

  setUserItems(items: SideMenuItem[]): void {
    this.userItemsChange.emit(items);
  }

  reset(): void {
    this.resetChange.emit();
  }
}
