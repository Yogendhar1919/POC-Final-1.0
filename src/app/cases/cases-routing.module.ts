import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { CasesListComponent } from './cases-list.component';

const routes: Routes = [{ path: '', component: CasesListComponent }];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule],
  providers: [],
})
export class CasesRoutingModule {}
