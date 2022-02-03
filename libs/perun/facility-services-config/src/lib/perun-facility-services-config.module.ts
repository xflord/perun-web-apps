import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceConfiguratorComponent } from './service-configurator/service-configurator.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { TranslateModule } from '@ngx-translate/core';
import { UiMaterialModule } from '@perun-web-apps/ui/material';
import { PerunDialogsModule } from '@perun-web-apps/perun/dialogs';

@NgModule({
  imports: [
    CommonModule,
    MatTabsModule,
    PerunSharedComponentsModule,
    TranslateModule,
    UiMaterialModule,
    PerunDialogsModule,
  ],
  declarations: [ServiceConfiguratorComponent],
  exports: [ServiceConfiguratorComponent],
})
export class PerunFacilityServicesConfigModule {}
