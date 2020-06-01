import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import {NgxElectronCoreModule} from '../../projects/ngx-electron/core/src/public-api';
import {NgxElectronStoreModule} from '../../projects/ngx-electron/store/src/public-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true
      }
    }),
    NgxElectronCoreModule,
    NgxElectronStoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
