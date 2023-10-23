import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { Author, CabinetManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_PUBLICATION_AUTHORS } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

export interface AddAuthorsDialogData {
  publicationId: number;
  alreadyAddedAuthors: Author[];
}

@Component({
  selector: 'perun-web-apps-add-authors-dialog',
  templateUrl: './add-authors-dialog.component.html',
  styleUrls: ['./add-authors-dialog.component.scss'],
})
export class AddAuthorsDialogComponent implements OnInit {
  searchControl: FormControl<string> = new FormControl('');
  successMessage: string;
  loading = false;
  searchLoading = false;
  firstSearchDone = false;
  publicationId: number;
  authors: Author[] = [];
  alreadyAddedAuthors: Author[] = [];
  tableIdAuthors = TABLE_PUBLICATION_AUTHORS;
  selection: SelectionModel<Author> = new SelectionModel<Author>(true, []);

  constructor(
    private dialogRef: MatDialogRef<AddAuthorsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddAuthorsDialogData,
    private notificator: NotificatorService,
    private cabinetService: CabinetManagerService,
    private translate: TranslateService,
  ) {
    translate
      .get('DIALOGS.ADD_AUTHORS.SUCCESS_MESSAGE')
      .subscribe((value: string) => (this.successMessage = value));
    this.publicationId = data.publicationId;
    this.alreadyAddedAuthors = data.alreadyAddedAuthors;
  }

  ngOnInit(): void {
    this.searchControl = new FormControl('', [
      Validators.required,
      Validators.pattern('.*[\\S]+.*'),
    ]);
  }

  onSearchByString(): void {
    this.firstSearchDone = true;
    if (!this.searchLoading && this.searchControl.value.trim() !== '') {
      this.searchLoading = true;
      this.cabinetService.findNewAuthors(this.searchControl.value).subscribe({
        next: (authors) => {
          authors = authors.filter(
            (item) => !this.alreadyAddedAuthors.map((author) => author.id).includes(item.id),
          );
          this.authors = authors;
          this.searchLoading = false;
        },
        error: () => {
          this.searchLoading = false;
        },
      });
    }
  }

  onAdd(): void {
    this.loading = true;
    if (this.selection.selected.length) {
      const author = this.selection.selected.pop();
      this.cabinetService
        .createAutorship({
          authorship: {
            id: 0,
            beanName: 'Authorship',
            publicationId: this.publicationId,
            userId: author.id,
          },
        })
        .subscribe({
          next: () => {
            this.onAdd();
          },
          error: () => (this.loading = false),
        });
    } else {
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
