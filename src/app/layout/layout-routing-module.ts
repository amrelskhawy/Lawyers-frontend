import { MainPage } from './Components/main-page/main-page';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Reservations } from './Components/reservations/reservations';
import { ArticlesList } from './Components/articles-list/articles-list';
import { ArticleDetails } from './Components/article-details/article-details';

const routes: Routes = [
  {path:"",component:MainPage},
  {path:"booking",component:Reservations},
  {path:"articles",component:ArticlesList},
  {path:"articles/:slug",component:ArticleDetails},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
