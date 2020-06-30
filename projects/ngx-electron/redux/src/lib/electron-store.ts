import {Action, ActionsSubject, ReducerManager, StateObservable, Store} from '@ngrx/store';
import {Injectable, NgZone} from '@angular/core';
import {ElectronService} from '@ngx-electron/core';
import {BrowserWindow, WebContents} from 'electron';
import {take} from 'rxjs/operators';

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
            this.electronService.ipcRenderer.on(`ngx-electron-action-shared-${windowsId}`,
                (event, action) => this.ngZone.run(() => super.dispatch(action)));

            const reduxSynchronizedType = '@ngx-electron/redux init state';
            this.electronService.ipcRenderer.once(`ngx-electron-synchronized-state`,
                (event, state) => this.ngZone.run(() => {
                    const reducers = (reducerManager as any).reducers;
                    Object.keys(reducers).forEach(key => {
                        const reducer = reducers[key];
                        reducers[key] = (s, action) => {
                            if (action.type === reduxSynchronizedType) {
                                return action.state;
                            }
                            return reducer.call(this, s, action);
                        };
                        this.addReducer(key, reducers[key]);
                        setTimeout(() => this.dispatch({type: reduxSynchronizedType, state: state[key]}));
                    });
                }));
        }
    }

    synchronized(targetWebContents: WebContents) {
        this.pipe(take(1)).subscribe(state =>
            targetWebContents.send(`ngx-electron-synchronized-state`, state));
    }


    /**
     * dispatch to all Windows
     * @param action action
     */
    dispatchToAllWindows<V extends Action = Action>(action: V): void {
        if (this.electronService.isElectron) {
            const wins = this.electronService.remote.BrowserWindow.getAllWindows();
            this.dispatchToWindows<V>(action, ...wins);
        }
    }

    dispatchToOpenerBrowserWindow<V extends Action = Action>(action: V) {
        if (this.electronService.isElectron && this.electronService.openerBrowserWindow) {
            this.dispatchToWindows(action, this.electronService.openerBrowserWindow);
        }
    }

    /**
     * dispatch action to windows by keys
     * @param action action
     * @param keys keys
     */
    dispatchToWindowsByKeys<V extends Action = Action>(action: V, ...keys: string[]): void {
        if (this.electronService.isElectron) {
            const winIds = keys.map(key => this.electronService.getWinIdByKey(key));
            this.dispatchToWindowsByIds(action, ...winIds);
        }
    }

    /**
     * dispatch action to windows by ids
     * @param action action
     * @param winIds winIds
     */
    dispatchToWindowsByIds<V extends Action = Action>(action: V, ...winIds: number[]): void {
        if (this.electronService.isElectron) {
            const wins = winIds.map(winId => this.electronService.remote.BrowserWindow.fromId(winId));
            this.dispatchToWindows<V>(action, ...wins);
        }
    }

    /**
     * dispatch action to windows by wins
     * @param action action
     * @param wins wins
     */
    dispatchToWindows<V extends Action = Action>(action: V, ...wins: BrowserWindow[]): void {
        if (this.electronService.isElectron) {
            wins.filter(win => !!win).forEach(win => win.webContents.send(`ngx-electron-action-shared-${win.id}`, action));
        }
    }

}
