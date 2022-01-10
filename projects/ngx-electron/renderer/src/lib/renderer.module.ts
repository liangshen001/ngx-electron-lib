import {ModuleWithProviders, NgModule, NgZone} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgxElectronContentMenusDirective} from './directives/ngx-electron-content-menus.directive';
import {NgxElectronDragDirective} from './directives/ngx-electron-drag.directive';
import {NgxElectronProxy} from '@ngx-electron/core';
import * as electron from 'electron';

export function ngxElectronProxyFactory() {
    return NgxElectronProxy.instanceOf<any>(electron);
}

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
    ],
    providers: [{
        provide: NgxElectronProxy,
        useFactory: ngxElectronProxyFactory
    }]
})
export class RendererModule {

}
