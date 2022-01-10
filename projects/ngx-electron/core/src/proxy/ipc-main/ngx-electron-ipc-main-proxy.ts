import {IpcMain, IpcMainEvent} from 'electron';
import {Observable} from 'rxjs';
import {ObservableUtil} from '../../utils/observable-util';
import {ChannelsMap} from '../ipc/ngx-electron-ipc-proxy';

export interface NgxElectronIpcMainProxy<T extends ChannelsMap> extends IpcMain {

    /**
     * Listens to `channel`, when a new message arrives `listener` would be called with
     * `listener(event, args...)`.
     */
    onChannel<K extends keyof T>(channel: K): Observable<{event: IpcMainEvent, data: T[K]}>;
    /**
     * Adds a one time `listener` function for the event. This `listener` is invoked
     * only the next time a message is sent to `channel`, after which it is removed.
     */
    onceChannel<K extends keyof T>(channel: K): Observable<{event: IpcMainEvent, data: T[K]}>;
}
