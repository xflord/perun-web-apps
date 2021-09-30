import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiMaterialModule } from '@perun-web-apps/ui/material';
import { TranslateModule } from '@ngx-translate/core';
import { FocusOnLinkerDialogComponent } from './focus-on-linker-dialog/focus-on-linker-dialog.component';
import { PerunPipesModule, UserFullNamePipe } from '@perun-web-apps/perun/pipes';
import { SimilarIdentityFriendlyNamesStringPipe } from './pipes/similar-identity-friendly-names-string.pipe';
import { ConsolidationResultComponent } from './consolidation-result/consolidation-result.component';

@NgModule({
  imports: [CommonModule, UiMaterialModule, TranslateModule, PerunPipesModule],
  declarations: [
    FocusOnLinkerDialogComponent,
    SimilarIdentityFriendlyNamesStringPipe,
    ConsolidationResultComponent,
  ],
  exports: [
    FocusOnLinkerDialogComponent,
    SimilarIdentityFriendlyNamesStringPipe,
    ConsolidationResultComponent,
  ],
  providers: [UserFullNamePipe],
})
export class LibLinkerModule {}
