import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'page1'
  },
  {
    path: 'page1',
    loadChildren: () => import('./modules/page1/page1.module').then(m => m.Page1Module),
  }, {
    path: 'page2',
    loadChildren: () => import('./modules/page2/page2.module').then(m => m.Page2Module)
  }, {
    path: 'page3',
    loadChildren: () => import('./modules/page3/page3.module').then(m => m.Page3Module)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
