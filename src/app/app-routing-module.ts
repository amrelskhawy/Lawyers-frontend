import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

{
    path: 'auth',
    loadChildren: () =>
      import('./authcation/authcation-module').then((m) => m.AuthcationModule),
  },

  {
    path: '',
    loadChildren: () =>
      import('./layout/layout-module').then((m) => m.LayoutModule),
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
