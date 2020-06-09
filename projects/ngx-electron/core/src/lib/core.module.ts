import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxElectronContentMenusDirective} from './directives/ngx-electron-content-menus.directive';
import {ElectronService} from './electron.service';
import {NgxElectronDragDirective} from './directives/ngx-electron-drag.directive';
import {RendererInterface} from 'electron';



@NgModule({
  declarations: [
    NgxElectronContentMenusDirective,
    NgxElectronDragDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NgxElectronContentMenusDirective,
    NgxElectronDragDirective
  ]
})
export class CoreModule {

}
