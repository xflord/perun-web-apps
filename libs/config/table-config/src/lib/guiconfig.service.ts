import { Injectable } from '@angular/core';

export const PREF_PAGE_SIZE = 'GUI_CONFIG.PREF_PAGE_SIZE';
export const LS_TABLE_PREFIX = 'GUI_CONFIG.PREF_PAGE_SIZE.';

@Injectable({
  providedIn: 'root',
})
export class GUIConfigService {
  constructor() {}

  public getString(key: string): string {
    return localStorage.getItem(key);
  }

  public getNumber(key: string): number {
    return parseInt(localStorage.getItem(key), 10);
  }

  public setNumber(key: string, value: number) {
    localStorage.setItem(key, value.toString());
  }
}
