import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'deleteDialogType',
})
export class DeleteDialogTypePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(anonymize: boolean): string {
    if (anonymize) {
      return this.translate.instant('DIALOGS.DELETE_ENTITY.TYPE_ANONYMIZE') as string;
    } else {
      return this.translate.instant('DIALOGS.DELETE_ENTITY.TYPE_DELETE') as string;
    }
  }
}
