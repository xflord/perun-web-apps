import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'applicationState',
  pure: false,
})
export class ApplicationStatePipe implements PipeTransform {
  private returnData = '';

  constructor(private translate: TranslateService) {}

  transform(value: string): string {
    switch (value) {
      case 'APPROVED': {
        this.translate.get('VO_DETAIL.APPLICATION.STATE.APPROVED').subscribe((response: string) => {
          this.returnData = `<i class="material-icons green">done</i>${response}`;
        });
        break;
      }
      case 'REJECTED': {
        this.translate.get('VO_DETAIL.APPLICATION.STATE.REJECTED').subscribe((response: string) => {
          this.returnData = `<i class="material-icons red">clear</i>${response}`;
        });
        break;
      }
      case 'NEW': {
        this.translate.get('VO_DETAIL.APPLICATION.STATE.NEW').subscribe((response: string) => {
          this.returnData = `<i class="material-icons orange">contact_mail</i> ${response}`;
        });
        break;
      }
      case 'VERIFIED': {
        this.translate.get('VO_DETAIL.APPLICATION.STATE.VERIFIED').subscribe((response: string) => {
          this.returnData = `<i class="material-icons blue">gavel</i>${response}`;
        });
        break;
      }
      default: {
        this.returnData = value;
        break;
      }
    }
    return this.returnData;
  }
}
