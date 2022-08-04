import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MemberCandidate } from '@perun-web-apps/perun/openapi';
import { TABLE_ADD_MEMBER_CANDIDATES_DIALOG } from '@perun-web-apps/config/table-config';
import { UntypedFormControl, Validators } from '@angular/forms';
import { FailedCandidate } from '../../../../vos/components/add-member.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss'],
})
export class AddMemberDialogComponent implements OnInit {
  @Input() loading = false;
  @Input() theme: string;
  @Input() languages: string[];
  @Input() manualAddingBlocked = false;
  @Input() inviteAuth = true;
  @Input() addAuth = true;
  @Input() members: MemberCandidate[] = [];
  @Input() failed: FailedCandidate[];
  @Input() selection = new SelectionModel<MemberCandidate>(true, []);
  @Output() add: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() search: EventEmitter<string> = new EventEmitter<string>();
  @Output() invite: EventEmitter<string> = new EventEmitter<string>();
  tableId = TABLE_ADD_MEMBER_CANDIDATES_DIALOG;
  searchCtrl: UntypedFormControl = new UntypedFormControl('', [
    Validators.required,
    Validators.pattern('.*[\\S]+.*'),
  ]);
  failedCandidateDataSource: MatTableDataSource<FailedCandidate>;

  ngOnInit(): void {
    this.failedCandidateDataSource = new MatTableDataSource(this.failed);
  }
}
