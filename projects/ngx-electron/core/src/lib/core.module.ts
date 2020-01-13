import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxElectronContentMenuDirective} from './directives/ngx-electron-content-menu.directive';
import {NgxElectronWindowComponent} from './components/ngx-electron-window/ngx-electron-window.component';
import {NgxElectronCoreModule} from '../public-api';
import {NgxElectronService} from './services/ngx-electron.service';
import {NgxElectronDragDirective} from './directives/ngx-electron-drag.directive';



@NgModule({
  declarations: [
    NgxElectronContentMenuDirective,
    NgxElectronDragDirective,
    NgxElectronWindowComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NgxElectronContentMenuDirective,
    NgxElectronDragDirective,
    NgxElectronWindowComponent
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxElectronCoreModule,
      providers: [
        NgxElectronService
      ]
    };
  }
}
