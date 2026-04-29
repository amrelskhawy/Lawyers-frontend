import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () =>
      import('./authcation/authcation-module').then((m) => m.AuthcationModule),
  },

  {
    path: 'sign-contract/:token',
    loadChildren: () =>
      import('./sign-contract/sign-contract-module').then((m) => m.SignContractModule),
  },

  {
    path: '',
    loadChildren: () =>
      import('./layout/layout-module').then((m) => m.LayoutModule),
  },

  {
    path: 'dashboard',
    loadChildren: () =>
      import('./layout-dashbord/layout-dashbord-module').then((m) => m.LayoutDashbordModule),
  },

  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
