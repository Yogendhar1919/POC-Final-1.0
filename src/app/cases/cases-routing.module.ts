import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { CasesListComponent } from './cases-list.component';
import { CropListComponent } from './crop-list/crop-list.component';
import { ARLineListComponent } from './arline-list/arline-list.component';
import { FieldPhotosComponent } from './field-photo/field-photo.component';
import { PhotoCommentComponent } from './photo-comment/photo-comment.component';

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
  {
    path: 'field-photo/:claimId/:policyCropId/:arlineId/:cropId/:countyId',
    component: FieldPhotosComponent,
  },
  {
    path: 'photo-comment/:claimid/:arlineid/:photoid',
    component: PhotoCommentComponent,
  },
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule],
  providers: [],
})
export class CasesRoutingModule {}
