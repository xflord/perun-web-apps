import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({ name: 'lastSuccessfulPropagation' })
export class LastSuccessfulPropagationPipe implements PipeTransform {
  transform(successAt: string): string {
    return successAt ? formatDate(successAt.toString(), 'yyyy.MM.dd HH:mm:ss', 'en') : 'NEVER';
  }
}
