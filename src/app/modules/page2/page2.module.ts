import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {containers} from './containers';
import {Page2RoutingModule} from './page2-routing.module';
import {ShareModule} from '../share/share.module';

@NgModule({
  imports: [
    Page2RoutingModule,
    ShareModule
  ],
  declarations: [
    ...containers
  ],
  providers: []
})
export class Page2Module {
}
