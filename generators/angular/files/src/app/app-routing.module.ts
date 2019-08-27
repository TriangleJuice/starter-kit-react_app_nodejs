import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './pages/home/home.page';
import { AboutPage } from './pages/about/about.page';
import { LoginPage } from './pages/login/login.page';

const routes: Routes = [
  {
    path: '', pathMatch: 'full', redirectTo: 'home'
  },
  {
    path: '',
    component: HomePage,
  },
  { path: 'about', component: AboutPage },
  { path: 'login', component: LoginPage }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
