import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupResourceStatus, PerunBean } from '@perun-web-apps/perun/openapi';
import { GroupWithStatus, ResourceWithStatus } from '@perun-web-apps/perun/models';

@Component({
  selector: 'perun-web-apps-entity-search-select',
  templateUrl: './entity-search-select.component.html',
  styleUrls: ['./entity-search-select.component.css'],
})
export class EntitySearchSelectComponent<T extends PerunBean>
  implements OnInit, OnChanges, OnDestroy
{
  @Input() entities: T[];
  @Input() selectPlaceholder = 'Select';
  @Input() findPlaceholder = 'Find...';
  @Input() noEntriesText = 'Nothing found';
  @Input() disableAutoSelect = false;
  @Input() entity: T = null;
  @Input() displayStatus = false;
  @Input() multiple = false;
  @Input() theme = '';
  @Output() entitySelected = new EventEmitter<T>();
  @ViewChild('scrollViewport', { static: false }) scrollViewport: CdkVirtualScrollViewport;
  @Input() searchFunction: (entity: T) => string;

  entitiesCtrl: FormControl = new FormControl();
  entityFilterCtrl: FormControl = new FormControl();
  filteredEntities = new ReplaySubject<T[]>(1);
  protected _onDestroy = new Subject<void>();
  private entitiesLen = 0;

  constructor(public cd: ChangeDetectorRef) {}

  @Input() mainTextFunction: (entity: T) => string = (entity) => JSON.stringify(entity);
  @Input() secondaryTextFunction: (entity: T) => string = (entity) =>
    '#'.concat(
      String(entity.id),
      entity['description'] ? '  '.concat(entity['description'] as string) : ''
    );

  statusTextFunction: (entity: GroupWithStatus | ResourceWithStatus) => GroupResourceStatus = (
    entity
  ) => entity.status;

  ngOnInit(): void {
    this.entitiesCtrl.valueChanges.subscribe((entity: T) => this.entitySelected.emit(entity));

    if (!this.disableAutoSelect && this.entity === null) {
      this.entitiesCtrl.setValue(this.entities[0]);
    }

    this.filteredEntities.subscribe((entities) => (this.entitiesLen = entities.length));

    this.entityFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterEntites();
    });

    if (this.entity !== null) {
      this.entitiesCtrl.setValue(this.entity);
    }
  }

  colorByStatus(entity: GroupWithStatus | ResourceWithStatus): string {
    switch (entity.status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'grey';
      case 'FAILED':
        return 'red';
      case 'PROCESSING':
        return 'black';
      default:
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.entity !== null) {
      this.entitiesCtrl.setValue(this.entity);
    }
    if (changes['entities']) {
      this.filteredEntities.next(this.entities.slice());
    }
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Transforms given string to ASCII and lower case
   * @param data
   */
  normalize(data: string): string {
    return data
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  openChange(): void {
    this.scrollViewport.scrollToIndex(0);
    this.scrollViewport.checkViewportSize();
  }

  getViewportHeight(): number {
    let height = this.entitiesLen * 48;
    if (height > 192) {
      height = 192;
    }
    if (this.scrollViewport) {
      this.scrollViewport.checkViewportSize();
    }
    return height;
  }

  multipleSelectedText(): string {
    const entities: T[] = this.entitiesCtrl.value as T[];
    if (!entities || entities.length === 0) {
      return;
    }

    if (entities.length === this.entities.length) {
      return 'ALL';
    } else if (entities.length > 1) {
      return this.mainTextFunction(entities[0]) + ` + ${entities.length - 1} other(s)`;
    } else {
      return this.mainTextFunction(entities[0]) + ' ' + this.secondaryTextFunction(entities[0]);
    }
  }

  private filterEntites(): void {
    if (!this.entities) {
      return;
    }
    // get the search keyword
    let search = this.entityFilterCtrl.value as string;
    if (!search) {
      this.filteredEntities.next(this.entities.slice());
      this.cd.detectChanges();
      return;
    } else {
      search = this.normalize(search);
    }
    // filter the banks
    this.filteredEntities.next(
      this.entities.filter((entity) => this.normalize(this.searchFunction(entity)).includes(search))
    );
    this.cd.detectChanges();
  }
}
