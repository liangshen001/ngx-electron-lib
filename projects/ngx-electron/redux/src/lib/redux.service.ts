import {Injectable, NgZone} from '@angular/core';
import {Action, Store} from '@ngrx/store';
import {concat} from 'rxjs';
import {NgxElectronService} from '@ngx-electron/renderer';
import {BrowserWindowConstructorOptions, IpcMainEvent} from 'electron';

export type BrowserWindowOptions = BrowserWindowConstructorOptions
    & { path: string, key?: string, parentKey?: string, parentId?: number, callback?: (event: IpcMainEvent) => void };

@Injectable({
  providedIn: 'root'
})
export class ReduxService {

  constructor(private store$: Store<any>,
              private electronService: NgxElectronService,
              private ngZone: NgZone) {
  }
}
