import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from '@nativescript/angular';

import { CasesListComponent } from './cases-list.component';
import { CaseItemComponent } from './case-item/case-item.component';
import { CasesRoutingModule } from './cases-routing.module';

@NgModule({
  imports: [
    CasesRoutingModule,
    NativeScriptCommonModule,
    NativeScriptFormsModule,
  ],
  declarations: [CasesListComponent, CaseItemComponent],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CasesModule {}
