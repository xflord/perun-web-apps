import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'memberTypeIcon',
})
export class MemberTypeIconPipe implements PipeTransform {
  transform(value: string): string {
    return value === 'DIRECT' ? 'person_pin_circle' : 'transfer_within_a_station';
  }
}
