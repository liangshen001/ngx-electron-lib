import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {containers} from './containers';
import {Page3RoutingModule} from './page3-routing.module';
import {ShareModule} from '../share/share.module';

@NgModule({
    imports: [
        Page3RoutingModule,
        ShareModule
    ],
    declarations: [
      ...containers
    ],
    providers: []
})
export class Page3Module {
}
