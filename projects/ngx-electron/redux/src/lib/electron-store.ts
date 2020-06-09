import {Action, ActionsSubject, ReducerManager, StateObservable, Store} from '@ngrx/store';
import {Injectable, NgZone} from '@angular/core';
import {ElectronService} from '@ngx-electron/core';
import {BrowserWindow} from 'electron';

@Injectable({
    providedIn: 'root'
})
export class ElectronStore<T> extends Store<T> {

    constructor(private electronService: ElectronService,
                private ngZone: NgZone,
                state$: StateObservable,
                actionsObserver: ActionsSubject,
                reducerManager: ReducerManager) {
        super(state$, actionsObserver, reducerManager);
        if (this.electronService.isElectron) {
            const windowsId = this.electronService.electron.remote.getCurrentWindow().id;
            // dispatch action
            this.electronService.electron.ipcRenderer.on(`ngx-electron-action-shared-${windowsId}`,
                (event, action) => this.ngZone.run(() => super.dispatch(action)));
            // window init
            this.electronService.electron.ipcRenderer.send(`ngx-electron-win-init-${windowsId}`);
        }
    }

    /**
     * dispatch to all Windows
     * @param action action
     */
    dispatchToAllWindows<V extends Action = Action>(action: V): void {
        if (this.electronService.isElectron) {
            this.electronService.electron.remote.BrowserWindow.getAllWindows()
                .forEach(win => this.dispatchToWindow((winId: number) => `ngx-electron-action-shared-${winId}`, action, win));
        }
    }

    /**
     * dispatch action to windows by keys
     * @param action action
     * @param keys keys
     */
    dispatchToWindowsByKeys<V extends Action = Action>(action: V, keys: string[]): void {
        if (this.electronService.isElectron) {
            const winIds = keys.map(key => this.electronService.getWinIdByKey(key));
            this.dispatchToWindowsByIds(action, winIds);
        }
    }

    /**
     * dispatch action to windows by ids
     * @param action action
     * @param winIds winIds
     */
    dispatchToWindowsByIds<V extends Action = Action>(action: V, winIds: number[]): void {
        if (this.electronService.isElectron) {
            winIds.map(winId => this.electronService.electron.remote.BrowserWindow.fromId(winId))
                .forEach(win => this.dispatchToWindow((winId: number) => `ngx-electron-action-shared-${winId}`, action, win));
        }
    }

    /**
     * dispatch action to window
     * @param action action
     * @param win window
     * @param channel channel
     */
    dispatchToWindow<V extends Action = Action>(channel: (winId: number) => string, action: V, win: BrowserWindow) {
        if (win && this.electronService.isElectron) {
            win.webContents.send(channel(win.id), action);
        }
    }
}
