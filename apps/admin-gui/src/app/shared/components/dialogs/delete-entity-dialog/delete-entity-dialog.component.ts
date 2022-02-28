import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Facility, Group, Resource, Vo } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-delete-entity-dialog',
  templateUrl: './delete-entity-dialog.component.html',
  styleUrls: ['./delete-entity-dialog.component.scss'],
})
export class DeleteEntityDialogComponent {
  @Input()
  title: string;
  @Input()
  entityNames: MatTableDataSource<Facility | Group | Vo | Resource> = new MatTableDataSource<
    Facility | Group | Vo | Resource
  >();
  @Input()
  entityType: string;
  @Input()
  relations: string[] = [];
  @Input()
  anotherMessage: string;
  @Input()
  disableForce = false;
  @Input()
  loading = false;

  @Output()
  deleted: EventEmitter<{ deleted: boolean; force: boolean }> = new EventEmitter<{
    deleted: boolean;
    force: boolean;
  }>();

  force = false;

  deleteReg = /^DELETE$/;
  deleteControl = new FormControl('', [Validators.required, Validators.pattern(this.deleteReg)]);

  onCancel(): void {
    const result = { deleted: false, force: false };
    this.deleted.emit(result);
  }

  onDelete(): void {
    const result = { deleted: true, force: this.force };
    this.deleted.emit(result);
  }
}
