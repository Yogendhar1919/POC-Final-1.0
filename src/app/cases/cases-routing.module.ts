import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { CasesListComponent } from './cases-list.component';
import { CropListComponent } from './crop-list/crop-list.component';
import { ARLineListComponent } from './arline-list/arline-list.component';

const routes: Routes = [
  { path: '', component: CasesListComponent },
  {
    path: 'crop-list/:caseId',
    component: CropListComponent,
  },
  {
    path: 'arline-list/:claimId/:policyCropId/:cropId/:countyId',
    component: ARLineListComponent,
  },
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule],
  providers: [],
})
export class CasesRoutingModule {}
