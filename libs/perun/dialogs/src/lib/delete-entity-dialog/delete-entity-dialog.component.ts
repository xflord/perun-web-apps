import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Facility, Group, Resource, Service, User, Vo } from '@perun-web-apps/perun/openapi';

type entityToDelete = Facility | Group | Vo | Resource | User | Service;

export interface DeleteDialogResult {
  deleted: boolean;
  force: boolean;
}

@Component({
  selector: 'perun-web-apps-delete-entity-dialog',
  templateUrl: './delete-entity-dialog.component.html',
  styleUrls: ['./delete-entity-dialog.component.scss'],
})
export class DeleteEntityDialogComponent implements OnInit {
  @Input()
  title: string;
  @Input()
  entityNames: MatTableDataSource<entityToDelete> = new MatTableDataSource<entityToDelete>();
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
  @Input()
  anonymize = false;

  @Output()
  deleted: EventEmitter<DeleteDialogResult> = new EventEmitter<DeleteDialogResult>();

  force = false;

  deleteReg: RegExp;
  deleteControl: FormControl;

  ngOnInit(): void {
    this.deleteReg = this.anonymize ? /^ANONYMIZE$/ : /^DELETE$/;
    this.deleteControl = new FormControl('', [
      Validators.required,
      Validators.pattern(this.deleteReg),
    ]);
  }

  onCancel(): void {
    const result = { deleted: false, force: false };
    this.deleted.emit(result);
  }

  onDelete(): void {
    const result = { deleted: true, force: this.force };
    this.deleted.emit(result);
  }
}
