import {IpcRenderer, IpcRendererEvent} from 'electron';
import {NgZone} from '@angular/core';
import {Observable} from 'rxjs';
import {ObservableUtil} from '../../utils/observable-util';
import {ChannelsMap} from '../ipc/ngx-electron-ipc-proxy';

export interface NgxElectronIpcRendererProxy<T extends ChannelsMap> extends IpcRenderer {
    // constructor(private ipcRenderer: IpcRenderer, ngZone: NgZone) {
    // }

    onChannel<K extends keyof T>(channel: K): Observable<{event: IpcRendererEvent, data: T[K]}>;
    onceChannel<K extends keyof T>(channel: K): Observable<{event: IpcRendererEvent, data: T[K]}>;

    /**
     * Send a message to the main process asynchronously via `channel`, you can also
     * send arbitrary arguments. Arguments will be serialized as JSON internally and
     * hence no functions or prototype chain will be included.
     *
     * The main process handles it by listening for `channel` with the `ipcMain`
     * module.
     */
    send<K extends keyof T>(channel: K, data: T[K]): void;
    /**
     * The value sent back by the `ipcMain` handler.
     *
     * Send a message to the main process synchronously via `channel`, you can also
     * send arbitrary arguments. Arguments will be serialized in JSON internally and
     * hence no functions or prototype chain will be included.
     *
     * The main process handles it by listening for `channel` with `ipcMain` module,
     * and replies by setting `event.returnValue`.
     *
     * **Note:** Sending a synchronous message will block the whole renderer process,
     * unless you know what you are doing you should never use it.
     */
    sendSync<K extends keyof T>(channel: K, data: T[K]): any;
    /**
     * Sends a message to a window with `webContentsId` via `channel`.
     */
    sendTo<K extends keyof T>(webContentsId: number, channel: K, data: T[K]): void;
    /**
     * Like `ipcRenderer.send` but the event will be sent to the `<webview>` element in
     * the host page instead of the main process.
     */
    sendToHost<K extends keyof T>(channel: K, data: T[K]);
}
