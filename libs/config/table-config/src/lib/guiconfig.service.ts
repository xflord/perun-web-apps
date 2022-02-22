import { Injectable } from '@angular/core';

export const PREF_PAGE_SIZE = 'GUI_CONFIG.PREF_PAGE_SIZE';
export const LS_TABLE_PREFIX = 'GUI_CONFIG.PREF_PAGE_SIZE.';

@Injectable({
  providedIn: 'root',
})
export class GUIConfigService {
  getString(key: string): string {
    return localStorage.getItem(key);
  }

  getNumber(key: string): number {
    return parseInt(localStorage.getItem(key), 10);
  }

  setNumber(key: string, value: number): void {
    localStorage.setItem(key, value.toString());
  }
}
