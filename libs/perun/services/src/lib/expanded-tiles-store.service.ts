import { Injectable } from '@angular/core';
import { ExpandableSectionId } from '@perun-web-apps/perun/models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
/**
 * Stores information about expandable sections inside 'localStorage'
 *
 * Shares expanded sections as an observable map
 * e.g. {'settings': true, 'resources': false}
 */
export class ExpandedTilesStoreService {
  private sectionState: BehaviorSubject<Map<ExpandableSectionId, boolean>>;
  // Right now there is no check if all sections are initialized and needs to be kept manually updated
  private sections: ExpandableSectionId[] = [
    'settings',
    'resources',
    'visualizer',
    'authentication',
  ];

  constructor() {
    const states = new Map<ExpandableSectionId, boolean>();
    for (const section of this.sections) {
      // Treat any set value as true, no entry as false
      states.set(section, !!localStorage.getItem(section));
    }
    this.sectionState = new BehaviorSubject(states);
  }

  setItem(sectionId: ExpandableSectionId): void {
    // Toggle value
    const newValue = !this.sectionState.value.get(sectionId);
    // Save changes to browser 'true' if expanded, no entry for closed
    if (newValue) {
      localStorage.setItem(sectionId, String(newValue));
    } else {
      localStorage.removeItem(sectionId);
    }

    // Propagate new value to all subscribers
    const currentState = this.sectionState.value;
    currentState.set(sectionId, newValue);
    this.sectionState.next(currentState);
  }

  getStates(): Observable<Map<ExpandableSectionId, boolean>> {
    return this.sectionState.asObservable();
  }
}
