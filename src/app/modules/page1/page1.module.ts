import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {containers} from './containers';
import {Page1RoutingModule} from './page1-routing.module';
import {ShareModule} from '../share/share.module';
import {EntityDataModule} from '@ngrx/data';

@NgModule({
    imports: [
        Page1RoutingModule,
        CommonModule,
        EntityDataModule,
      ShareModule
    ],
    declarations: [
      ...containers
    ],
    providers: []
})
export class Page1Module {
}
