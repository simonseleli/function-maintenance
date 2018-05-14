import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListComponent} from "./components/list/list.component";
import {FunctionComponent} from "./components/function/function.component";
//import {DataEntryComponent} from "./data-entry.component";

const routes: Routes = [
  { path: '', redirectTo: '/functions', pathMatch: 'full' },

  {
    path: 'functions', component: ListComponent,
  },
  {
    path: 'functions/:id', component: FunctionComponent,
  },
  {
    path: 'functions/:id/:operation', component: FunctionComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash: true})],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
