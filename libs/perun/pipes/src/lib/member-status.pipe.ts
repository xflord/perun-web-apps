import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'memberStatus'
})
export class MemberStatusPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace('VALID', 'ACTIVE');
  }

}
