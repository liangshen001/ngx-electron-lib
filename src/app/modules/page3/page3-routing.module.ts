import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Page3IndexComponent} from './containers/index/page3-index.component';


const routes: Routes = [{
    path: '',
    component: Page3IndexComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Page3RoutingModule { }
