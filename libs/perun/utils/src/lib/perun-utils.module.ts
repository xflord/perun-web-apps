import { NgModule } from '@angular/core';
import { TableWrapperComponent } from './table-wrapper/table-wrapper.component';
import { TableOptionsComponent } from './table-options/table-options.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ExportTableDialogComponent } from './export-table-dialog/export-table-dialog.component';
import { UiMaterialModule } from '@perun-web-apps/ui/material';
import { MatRadioModule } from '@angular/material/radio';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [TranslateModule, CommonModule, ReactiveFormsModule, UiMaterialModule, MatRadioModule],
  declarations: [TableWrapperComponent, TableOptionsComponent, ExportTableDialogComponent],
  exports: [TableWrapperComponent, TableOptionsComponent, ExportTableDialogComponent],
  providers: [],
})
export class PerunUtilsModule {}
