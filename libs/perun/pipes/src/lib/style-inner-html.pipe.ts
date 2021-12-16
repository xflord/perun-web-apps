import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'styleInnerHtml'
})
export class StyleInnerHtmlPipe implements PipeTransform {

  transform(value: string): string {
    const parts = value.toString().split(" ");
    switch (parts[0].trim()){
      case "<svg":
        return value.replace(/height="\d+"/,'height="20"');
      case "<img":
        parts.splice(1, 0, "style=\"height: 20px\"");
        return parts.join(" ")
    }
    return value;
  }

}
