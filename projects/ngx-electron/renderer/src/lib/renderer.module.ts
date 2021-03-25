import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgxElectronContentMenusDirective} from './directives/ngx-electron-content-menus.directive';
import {NgxElectronDragDirective} from './directives/ngx-electron-drag.directive';


@NgModule({
    declarations: [
        NgxElectronContentMenusDirective,
        NgxElectronDragDirective
    ],
    imports: [
        CommonModule,
        HttpClientModule,
    ],
    exports: [
        NgxElectronContentMenusDirective,
        NgxElectronDragDirective
    ]
})
export class RendererModule {

}
