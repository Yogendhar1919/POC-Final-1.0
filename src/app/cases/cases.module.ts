import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from '@nativescript/angular';

import { CasesListComponent } from './cases-list.component';
import { CasesRoutingModule } from './cases-routing.module';

@NgModule({
  imports: [
    CasesRoutingModule,
    NativeScriptCommonModule,
    NativeScriptFormsModule,
  ],
  declarations: [CasesListComponent],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CasesModule {}
