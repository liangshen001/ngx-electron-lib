import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {components} from './components';
import {NgxElectronCoreModule} from '../../../../projects/ngx-electron/core/src/public-api';
import {NgxElectronStoreModule} from '../../../../projects/ngx-electron/store/src/public-api';

@NgModule({
    imports: [
        CommonModule,
        NgxElectronCoreModule,
        NgxElectronStoreModule,
        FormsModule
    ],
    declarations: [
        ...components
    ],
    providers: [],
    exports: [
        CommonModule,
        NgxElectronCoreModule,
        NgxElectronStoreModule,
        FormsModule,
        ...components
    ]
})
export class ShareModule {
}
