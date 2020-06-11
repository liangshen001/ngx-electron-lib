import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {components} from './components';
import {NgxElectronCoreModule} from '@ngx-electron/core';
import {NgxElectronReduxModule} from '@ngx-electron/redux';

@NgModule({
    imports: [
        CommonModule,
        NgxElectronCoreModule,
        NgxElectronReduxModule,
        FormsModule
    ],
    declarations: [
        ...components
    ],
    providers: [],
    exports: [
        CommonModule,
        NgxElectronCoreModule,
        NgxElectronReduxModule,
        FormsModule,
        ...components
    ]
})
export class ShareModule {
}
