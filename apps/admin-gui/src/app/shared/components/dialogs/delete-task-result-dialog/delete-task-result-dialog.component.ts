import { Component, Inject, OnInit } from '@angular/core';
import { TaskResult, TasksManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';

export interface DeleteTaskResultDialogData {
  theme: string;
  taskResults: TaskResult[];
}

@Component({
  selector: 'app-delete-task-result-dialog',
  templateUrl: './delete-task-result-dialog.component.html',
  styleUrls: ['./delete-task-result-dialog.component.scss'],
})
export class DeleteTaskResultDialogComponent implements OnInit {
  loading = false;
  theme: string;
  dataSource = new MatTableDataSource<TaskResult>(this.data.taskResults);
  displayedColumns = ['id', 'destination', 'time'];
  private taskResults: TaskResult[];

  constructor(
    private dialogRef: MatDialogRef<DeleteTaskResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: DeleteTaskResultDialogData,
    private taskManager: TasksManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.taskResults = this.data.taskResults;
  }

  onDelete(): void {
    this.loading = true;
    if (this.taskResults.length === 0) {
      this.dialogRef.close(true);
      this.loading = false;
      this.notificator.showSuccess(
        this.translate.instant('DIALOGS.DELETE_TASK_RESULT.SUCCESS') as string
      );
      return;
    }
    this.taskManager.deleteTaskResultById({ taskResultId: this.taskResults.pop().id }).subscribe(
      () => {
        this.onDelete();
      },
      () => (this.loading = false)
    );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
