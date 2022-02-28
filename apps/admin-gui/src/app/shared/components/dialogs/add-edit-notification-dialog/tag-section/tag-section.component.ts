import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tag-section',
  templateUrl: './tag-section.component.html',
  styleUrls: ['./tag-section.component.scss'],
})
export class TagSectionComponent {
  @Input()
  tags: string[][] = [];

  @Output()
  addedTag = new EventEmitter<string>();

  addTag(tag: string): void {
    this.addedTag.emit(tag);
  }
}
