import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {components} from './components';
import {NgxElectronRendererModule} from '@ngx-electron/renderer';
import {NgxElectronReduxModule} from '@ngx-electron/redux';
import {StoreModule} from '@ngrx/store';

@NgModule({
    imports: [
        CommonModule,
        NgxElectronRendererModule,
        NgxElectronReduxModule,
        FormsModule,
    ],
    declarations: [
        ...components
    ],
    providers: [],
    exports: [
        CommonModule,
        NgxElectronRendererModule,
        NgxElectronReduxModule,
        FormsModule,
        ...components
    ]
})
export class ShareModule {
}
