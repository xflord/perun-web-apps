import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingTableComponent } from './loading-table/loading-table.component';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { LogoutLoaderComponent } from './logout-loader/logout-loader.component';

@NgModule({
  imports: [MatIconModule, CommonModule, MatProgressSpinnerModule],
  declarations: [LoadingTableComponent, LoadingDialogComponent, LogoutLoaderComponent],
  exports: [LoadingTableComponent, LoadingDialogComponent, LogoutLoaderComponent],
})
export class UiLoadersModule {}
