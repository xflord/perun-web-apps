import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PerunTranslateService extends TranslateService {
  instant(key: string | Array<string>, interpolateParams?: unknown): string {
    return String(super.instant(key, interpolateParams));
  }
}
