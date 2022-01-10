import {App, BrowserWindow} from 'electron';
import {Observable} from "rxjs";


export interface NgxElectronAppProxy extends App {
    // onAccessibilitySupportChanged: Observable<{ event: Event; accessibilitySupportEnabled: boolean; }>
    // onceAccessibilitySupportChanged: Observable<{ event: Event; accessibilitySupportEnabled: boolean; }>
    onBrowserWindowCreated: Observable<{ event: Event; window: BrowserWindow; }>
}
