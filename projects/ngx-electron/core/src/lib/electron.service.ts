import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {concat, Observable, Subject} from 'rxjs';
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    MenuItemConstructorOptions,
    RendererInterface,
    Remote,
    IpcMainEvent,
    IpcRenderer,
    IpcRendererEvent,
    Rectangle,
    Point,
    Tray
} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import {TrayProxy} from './tray-proxy';
import {AutoUpdaterProxy} from './auto-updater-proxy';

export type BrowserWindowOptions =
    BrowserWindowConstructorOptions
    & { path: string, key?: string, parentKey?: string, parentId?: number, callback?: (event: IpcMainEvent) => void };



@Injectable({
    providedIn: 'root'
})
export class ElectronService {
    openerBrowserWindow?: BrowserWindow;

    electron?: RendererInterface;

    remote?: Remote;

    ipcRenderer?: IpcRenderer;

    childProcess?: typeof childProcess;
    fs?: typeof fs;

    /**
     * 自动更新
     */
    autoUpdater?: AutoUpdaterProxy;

    tray?: TrayProxy;

    /**
     * 判断是否为electron环境
     */
    isElectron = !!window.navigator.userAgent.match(/Electron/);

    get isServe(): boolean {
        return this.isElectron && this.ipcRenderer.sendSync('ngx-electron-is-serve');
    }

    get isOpenDevTools(): boolean {
        return this.isElectron && this.ipcRenderer.sendSync('ngx-electron-is-open-dev-tools');
    }

    get port(): string {
        return this.isElectron && this.ipcRenderer.sendSync('ngx-electron-get-port');
    }

    get host(): string {
        return this.isElectron && this.ipcRenderer.sendSync('ngx-electron-get-host');
    }

    get isMac(): boolean {
        return this.isElectron && this.ipcRenderer.sendSync('ngx-electron-is-mac');
    }

    get isWindows(): boolean {
        return this.isElectron && this.ipcRenderer.sendSync('ngx-electron-is-windows');
    }

    get isLinux(): boolean {
        return this.isElectron && this.ipcRenderer.sendSync('ngx-electron-is-linux');
    }

    constructor(private router: Router,
                private ngZone: NgZone) {
        if (!this.isElectron) {
            return;
        }
        this.electron = (window as any).require('electron');
        this.remote = this.electron.remote;
        this.ipcRenderer = this.electron.ipcRenderer;

        if (!this.remote.ipcMain.listenerCount('ngx-electron-load-electron-main')) {
            throw new Error('@ngx-electron/main is not imported in electron main');
        }

        this.ipcRenderer.on('ngx-electron-main-tray-created', () => {
            if (!this.tray) {
                this.initTray();
            }
        });
        this.ipcRenderer.on('ngx-electron-main-tray-destroyed', () => {
            if (this.tray) {
                this.tray = null;
            }
        });
        if (this.remote.ipcMain.listenerCount('ngx-electron-renderer-tray-created')) {
            this.initTray();
        }
        this.autoUpdater = new AutoUpdaterProxy(this.ipcRenderer, this.remote);
        this.childProcess = (window as any).require('child_process');
        this.fs = (window as any).require('fs');

        const winId = this.remote.getCurrentWindow().id;
        if (this.remote.ipcMain.listenerCount(`ngx-electron-renderer-win-initialized-${winId}`)) {
            const openerWindowId = +this.ipcRenderer.sendSync(`ngx-electron-renderer-win-initialized-${winId}`);
            this.openerBrowserWindow = this.remote.BrowserWindow.fromId(openerWindowId);
        }
    }
    createTray(image) {
        this.ipcRenderer.sendSync('ngx-electron-renderer-create-tray', image);
        this.initTray();
        return this.tray;
    }
    private initTray() {
        this.tray = new TrayProxy(this.ipcRenderer, this.remote, this.ngZone);
    }

    sendDataToWindowsByKeys<T>(data: T, ...keys: string[]) {
        if (this.isElectron) {
            const ids = keys.map(key => this.getWinIdByKey(key));
            this.sendDataToWindowsByIds<T>(data, ...ids);
        }
    }

    sendDataToWindowsByIds<T>(data: T, ...ids: number[]) {
        if (this.isElectron) {
            const wins = ids.map(id => this.remote.BrowserWindow.fromId(id));
            this.sendDataToWindows<T>(data, ...wins);
        }
    }

    sendDataToAllWindows<T>(data: T) {
        if (this.isElectron) {
            const wins = this.remote.BrowserWindow.getAllWindows();
            this.sendDataToWindows<T>(data, ...wins);
        }
    }

    sendDataToWindows<T>(data: T, ...wins: BrowserWindow[]) {
        if (this.isElectron) {
            wins.filter(win => !!win).forEach(win => win.webContents.send('ngx-electron-renderer-core-data', data));
        }
    }

    sendDataToOpenerWindow<T>(data: T) {
        if (this.isElectron && this.openerBrowserWindow) {
            this.sendDataToWindows(data, this.openerBrowserWindow);
        }
    }

    createWindow(options: BrowserWindowOptions): BrowserWindow | null {
        if (this.isElectron) {
            // 判断主进程是否加载所需文件
            const winId = this.getWinIdByKey(options.key);
            let win: BrowserWindow;
            if (winId) {
                win = this.remote.BrowserWindow.fromId(winId);
                win.focus();
            } else {
                let parentWinId = options.parentId;
                if (parentWinId === undefined && options.parentKey) {
                    parentWinId = this.getWinIdByKey(options.parentKey);
                }
                if (parentWinId) {
                    options.parent = this.remote.BrowserWindow.fromId(parentWinId);
                }
                win = new this.remote.BrowserWindow({
                    show: false,
                    ...options
                });
                const httpUrl = this.isServe ? `http://${location.hostname}:${location.port}/#${options.path}` :
                    `${url.format({
                        pathname: path.join(this.remote.app.getAppPath(),
                            'dist', this.remote.app.getName(), 'index.html'),
                        protocol: 'file:',
                        slashes: true
                    })}#${options.path}`;
                console.log(`load url:${httpUrl}`);
                win.loadURL(httpUrl);
                if (this.isOpenDevTools) {
                    win.webContents.openDevTools();
                }
                if (options.key) {
                    this.ipcRenderer.send('ngx-electron-renderer-win-created', options.key, win.id);
                }
                win.once('closed', () => {
                    if (options.key) {
                        this.ipcRenderer.send('ngx-electron-renderer-win-destroyed', options.key);
                    }
                    win = null;
                });
                win.once('ready-to-show', () => win.show());
                this.remote.ipcMain.on(`ngx-electron-renderer-win-initialized-${win.id}`, event => {
                    event.returnValue = this.remote.getCurrentWindow().id;
                    if (options.callback) {
                        options.callback(event);
                    }
                });
            }
            return win;
        }
        return null;
    }

    /**
     * 获得其他窗口发送据 注意：数据在的数发送过程中json序列化 会去掉方法和原型
     * @return Observable
     */
    data<T>(): Observable<{ event: IpcRendererEvent, data?: T }> {
        return new Observable<{ event: IpcRendererEvent, data?: T }>(observer => {
            if (this.isElectron) {
                this.ipcRenderer.on('ngx-electron-renderer-core-data',
                    (event, data) => this.ngZone.run(() => setTimeout(() => observer.next({event, data}))));
            }
        });
    }


    /**
     *
     * 获得此key的窗口 若key值的窗口不存在则返回 null
     * 在调用之前要确保主进程初始化了@ngx-electron/electron-main模块 否则不要调用此方法
     * @param key key
     * @return 如果返回null说明 没有此key的窗口
     */
    getWinIdByKey(key: string): number {
        return this.isElectron && this.ipcRenderer.sendSync('ngx-electron-renderer-get-win-id-by-key', key);
    }

}

