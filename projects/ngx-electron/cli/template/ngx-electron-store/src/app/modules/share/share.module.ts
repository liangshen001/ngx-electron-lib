import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NgxElectronCoreModule} from '@ngx-electron/core';
import {NgxElectronStoreModule} from '@ngx-electron/store';
import {components} from './components';

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
