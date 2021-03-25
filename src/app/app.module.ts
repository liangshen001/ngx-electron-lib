import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {StoreModule} from '@ngrx/store';
import {metaReducers, reducers} from './reducers';
import {NgxElectronRendererModule} from '@ngx-electron/renderer';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxElectronReduxModule} from '@ngx-electron/redux';
import {HttpClientModule} from '@angular/common/http';
import {EffectsModule} from '@ngrx/effects';
import {effects} from './effects';

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
        NgxElectronRendererModule,
        NgxElectronReduxModule,
        HttpClientModule,
        BrowserAnimationsModule,
        EffectsModule.forRoot(effects),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
