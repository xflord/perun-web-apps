import {Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tag-section',
  templateUrl: './tag-section.component.html',
  styleUrls: ['./tag-section.component.scss']
})
export class TagSectionComponent {

  constructor() { }

  @Input()
  tags: [][] = [];

  @Output()
  addedTag = new EventEmitter<string>();

  addTag(tag: string) {
    this.addedTag.emit(tag);
  }
}
