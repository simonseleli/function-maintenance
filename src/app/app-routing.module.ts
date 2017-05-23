import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainComponent} from "./components/main/main.component";
//import {DataEntryComponent} from "./data-entry.component";

const routes: Routes = [
  {
    path: 'function/:id/dx/:dx/pe/:pe/ou/:ou', component: MainComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash: true})],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
