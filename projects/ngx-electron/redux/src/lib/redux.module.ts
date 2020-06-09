import {NgModule, NgZone} from '@angular/core';
import {NgxElectronCoreModule} from '@ngx-electron/core';
import {Action, Store, StoreFeatureModule, StoreModule} from '@ngrx/store';


@NgModule({
  declarations: [],
  imports: [
      NgxElectronCoreModule,
      StoreModule,
  ],
  exports: []
})
export class ReduxModule {
    constructor(private store$: Store<any>,
                private ngZone: NgZone) {
    }
}
