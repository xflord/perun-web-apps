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
import { MatInput } from '@angular/material/input';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-debounce-filter',
  templateUrl: './debounce-filter.component.html',
  styleUrls: ['./debounce-filter.component.scss'],
})
export class DebounceFilterComponent implements OnInit {
  @Input() placeholder: string;
  @Input() autoFocus = false;
  @Input() control: FormControl = new FormControl();
  @Input() error: string;
  @Output() filter = new EventEmitter<string>();
  @ViewChild('input', { static: true }) input: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    if (this.autoFocus) this.input.nativeElement.focus();
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        map((event: KeyboardEvent) => {
          const target: MatInput = event.target as unknown as MatInput;
          return target.value;
        }),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        if (!this.control.invalid) {
          this.filter.emit(text);
        }
      });
  }
}
