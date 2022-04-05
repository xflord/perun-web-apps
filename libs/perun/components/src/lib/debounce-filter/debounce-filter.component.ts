import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'perun-web-apps-debounce-filter',
  templateUrl: './debounce-filter.component.html',
  styleUrls: ['./debounce-filter.component.scss'],
})
export class DebounceFilterComponent implements OnInit {
  constructor() {}

  @Input()
  placeholder: string;

  @Output()
  filter = new EventEmitter<string>();

  @Input()
  autoFocus = false;

  @ViewChild('groupFilterInput', { static: true }) groupFilterInput: ElementRef;

  ngOnInit() {
    if (this.autoFocus) this.groupFilterInput.nativeElement.focus();
    fromEvent(this.groupFilterInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.target.value),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        this.filter.emit(text);
      });
  }
}
