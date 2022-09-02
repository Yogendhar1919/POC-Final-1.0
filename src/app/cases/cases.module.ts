import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from '@nativescript/angular';

import { CasesListComponent } from './cases-list.component';
import { CaseItemComponent } from './case-item/case-item.component';
import { CasesRoutingModule } from './cases-routing.module';
import { CropListComponent } from './crop-list/crop-list.component';
import { ARLineListComponent } from './arline-list/arline-list.component';
import { CropItemComponent } from './crop-item/crop-item.component';
import { ARLineItemComponent } from './arline-item/arline-item.component';
import { FieldPhotosComponent } from './field-photo/field-photo.component';
import { PolicyHeaderComponent } from './policy-header/policy-header.component';
import { PhotoCommentComponent } from './photo-comment/photo-comment.component';

import { PhotoService } from './shared/photo.service';
import { LocationService } from './shared/location.service';
import { ClaimsFileSystemService } from './shared/claims-filesystem.service';
import { ImageProvider } from './shared/image.provider';

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
    ARLineListComponent,
    ARLineItemComponent,
    PolicyHeaderComponent,
    PhotoCommentComponent,
    FieldPhotosComponent,
  ],
  providers: [
    PhotoService,
    LocationService,
    ClaimsFileSystemService,
    ImageProvider,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class CasesModule {}
