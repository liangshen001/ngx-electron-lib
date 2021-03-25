import {AllElectron, MainInterface, RendererInterface} from 'electron';
import {NgZone} from '@angular/core';
import {IpcProxy} from './ipc-proxy';
import {NgxElectronBrowserWindowProxyUtil} from './ngx-electron-browser-window-proxy';

export class ElectronProxy {
    /**
     * 代理主进程
     */
    public static proxy(electron: MainInterface);
    /**
     * 代理渲染进程
     */
    public static proxy(electron: RendererInterface, ngZone: NgZone);
    public static proxy(electron: AllElectron, ngZone?: NgZone) {
        const isRenderer = !!ngZone;
        // 对ipc进行代理
        IpcProxy.proxy(isRenderer ? electron.ipcRenderer : electron.ipcMain, ngZone);
        // 对创建的窗口进行代理
        NgxElectronBrowserWindowProxyUtil.proxy(ngZone);
    }

}
