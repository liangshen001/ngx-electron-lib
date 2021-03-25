import {NgModule, NgZone} from '@angular/core';
import {NgxElectronRendererModule} from '@ngx-electron/renderer';
import {Action, Store, StoreFeatureModule, StoreModule} from '@ngrx/store';


@NgModule({
  declarations: [],
  imports: [
      NgxElectronRendererModule,
      StoreModule,
  ],
  exports: []
})
export class ReduxModule {
    constructor(private store$: Store<any>,
                private ngZone: NgZone) {
    }
}
