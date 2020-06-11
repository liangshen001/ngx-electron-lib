import {ModuleWithProviders, NgModule} from '@angular/core';
import {NgxElectronCoreModule} from '@ngx-electron/core';
import {StoreService} from './store.service';

@NgModule({
  declarations: [],
  imports: [
    NgxElectronCoreModule
  ],
  exports: []
})
export class StoreModule {
}
