import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from '@nativescript/angular';

import { CasesListComponent } from './cases-list.component';
import { CaseItemComponent } from './case-item/case-item.component';
import { CasesRoutingModule } from './cases-routing.module';
import { CropListComponent } from './crop-list/crop-list.component';
import { CropItemComponent } from './crop-item/crop-item.component';

@NgModule({
  imports: [
    CasesRoutingModule,
    NativeScriptCommonModule,
    NativeScriptFormsModule,
  ],
  declarations: [
    CasesListComponent,
    CaseItemComponent,
    CropListComponent,
    CropItemComponent,
  ],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CasesModule {}
