import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Type } from '@perun-web-apps/perun/openapi';

@Pipe({
  name: 'applicationFormItemType',
})
export class ApplicationFormItemTypePipe implements PipeTransform {
  private returnData = '';

  constructor(private translateService: TranslateService) {}

  transform(value: Type): string {
    switch (value) {
      case 'HEADING': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.HEADER')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'HTML_COMMENT': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.HTML_COMMENT')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'TEXTFIELD': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.TEXTFIELD')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'VALIDATED_EMAIL': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.VALIDATED_EMAIL')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'USERNAME': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.USERNAME')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'PASSWORD': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.PASSWORD')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'SELECTIONBOX': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.SELECTIONBOX')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'TEXTAREA': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.TEXTAREA')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'COMBOBOX': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.COMBOBOX')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'CHECKBOX': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.CHECKBOX')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'SUBMIT_BUTTON': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.SUBMIT_BUTTON')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'RADIO': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.RADIO')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'TIMEZONE': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.TIMEZONE')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'AUTO_SUBMIT_BUTTON': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.AUTO_SUBMIT_BUTTON')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'EMBEDDED_GROUP_APPLICATION': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.EMBEDDED_GROUP_APPLICATION')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'LIST_INPUT_BOX': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.LIST_INPUT_BOX')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      case 'MAP_INPUT_BOX': {
        this.translateService
          .get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.MAP_INPUT_BOX')
          .subscribe((text: string) => {
            this.returnData = text;
          });
        break;
      }
      default: {
        return value;
      }
    }
    return this.returnData;
  }
}
