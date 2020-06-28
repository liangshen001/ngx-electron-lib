import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {concat, Observable, Subject} from 'rxjs';
import {TrayProxy} from './models';
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    MenuItemConstructorOptions,
    RendererInterface,
    IpcMainEvent,
    IpcRendererEvent
} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import {autoUpdater} from 'electron-updater';

export type BrowserWindowOptions =
    BrowserWindowConstructorOptions
    & { path: string, key?: string, parentKey?: string, parentId?: number, callback?: (event: IpcMainEvent) => void };

@Injectable({
    providedIn: 'root'
})
export class ElectronService {
    openerWindowId?: number;

    electron?: RendererInterface;

    childProcess?: typeof childProcess;
    fs?: typeof fs;

    private _tray: TrayProxy;

    autoUpdater: {
        error: Observable<any>,
        checkingForUpdate: Observable<void>,
        updateAvailable: Observable<{
            files: {sha512: string; size: number; url: string}[];
            path: string;
            releaseDate: string;
            sha512: string;
            version: string;
        }>,
        updateNotAvailable: Observable<any>,
        downloadProgress: Observable<any>,
        updateDownloateDownloaded: Observable<{
            event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate
        }>,
        checkForUpdates(): void,
        downloadUpdate(): void,
        quitAndInstall(isSilent?: boolean, isForceRunAfter?: boolean): void,
    };

    get tray(): TrayProxy {
        if (this._tray) {
            return this._tray;
        } else if (this.isElectron && this.electron.remote.ipcMain.listenerCount('ngx-electron-tray-created')) {
            this._tray = {
                on: (event: string, listener: any) => {
                    const timestamp = new Date().getTime();
                    this.electron.ipcRenderer.on(`ngx-electron-tray-on-${event}-${timestamp}`, listener);
                    this.electron.ipcRenderer.send(`ngx-electron-tray-on-event`, event, timestamp);
                },
                once: (event: string, listener: any) => {
                    const timestamp = new Date().getTime();
                    this.electron.ipcRenderer.on(`ngx-electron-tray-once-${event}-${timestamp}`, listener);
                    this.electron.ipcRenderer.send(`ngx-electron-tray-once-event`, event, timestamp);
                },
                destroy: () => this.electron.ipcRenderer.send('ngx-electron-tray-apply-method', 'destroy'),
                setHighlightMode: (mode: string) => this.electron.ipcRenderer.send(
                    'ngx-electron-tray-apply-method', 'setHighlightMode', mode),
                setTitle: (title) => this.electron.ipcRenderer.send('ngx-electron-tray-apply-method', 'setTitle', title),
                setToolTip: toolTip => this.electron.ipcRenderer.send('ngx-electron-tray-apply-method', 'setToolTip', toolTip),
                setImage: (image, isWeb) => this.electron.ipcRenderer.send('ngx-electron-tray-apply-method', 'setImage', image, isWeb),
                setContextMenuTemplate: this.setTrayContextMenu.bind(this)
            };
            return this._tray;
        } else {
            return null;
        }
    }

    /**
     * 判断是否为electron环境
     */
    isElectron = !!window.navigator.userAgent.match(/Electron/);

    get isServe(): boolean {
        return this.isElectron && this.electron.ipcRenderer.sendSync('ngx-electron-is-serve');
    }

    get isOpenDevTools(): boolean {
        return this.isElectron && this.electron.ipcRenderer.sendSync('ngx-electron-is-open-dev-tools');
    }

    get port(): string {
        return this.isElectron && this.electron.ipcRenderer.sendSync('ngx-electron-get-port');
    }

    get host(): string {
        return this.isElectron && this.electron.ipcRenderer.sendSync('ngx-electron-get-host');
    }

    get isMac(): boolean {
        return this.isElectron && this.electron.ipcRenderer.sendSync('ngx-electron-is-mac');
    }

    get isWindows(): boolean {
        return this.isElectron && this.electron.ipcRenderer.sendSync('ngx-electron-is-windows');
    }

    get isLinux(): boolean {
        return this.isElectron && this.electron.ipcRenderer.sendSync('ngx-electron-is-linux');
    }

    constructor(private router: Router,
                private ngZone: NgZone) {
        if (!this.isElectron) {
            return;
        }
        this.electron = (window as any).require('electron');
        this.autoUpdater = {
            error: new Observable(subscriber => {
                this.electron.ipcRenderer.on('ngx-electron-main-updator-error', (event, error) => subscriber.next(error));
            }),
            checkingForUpdate: new Observable(subscriber => {
                this.electron.ipcRenderer.on('ngx-electron-main-checking-for-update', () => subscriber.next());
            }),
            updateAvailable: new Observable(subscriber => {
                this.electron.ipcRenderer.on('ngx-electron-main-update-available', (e, info) => subscriber.next(info));
            }),
            updateNotAvailable: new Observable(subscriber => {
                this.electron.ipcRenderer.on('ngx-electron-main-update-not-available', (e, info) => subscriber.next(info));
            }),
            downloadProgress: new Observable(subscriber => {
                this.electron.ipcRenderer.on('ngx-electron-main-download-progress', () => subscriber.next());
            }),
            updateDownloateDownloaded: new Observable(subscriber => {
                this.electron.ipcRenderer.on('ngx-electron-main-update-downloate-downloaded',
                    (e, event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) => subscriber.next({
                        event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate
                    }));
            }),
            checkForUpdates: () => {
                this.electron.ipcRenderer.send('ngx-electron-renderer-check-for-updates');
            },
            downloadUpdate: () => {
                this.electron.ipcRenderer.send('ngx-electron-renderer-download-update');
            },
            quitAndInstall: (isSilent?: boolean, isForceRunAfter?: boolean) => {
                this.electron.ipcRenderer.send('ngx-electron-renderer-quit-and-install', isSilent, isForceRunAfter);
            }
        };
        this.childProcess = (window as any).require('child_process');
        this.fs = (window as any).require('fs');

        if (!this.electron.remote.ipcMain.listenerCount('ngx-electron-load-electron-main')) {
            throw new Error('@ngx-electron/main is not imported in electron main');
        }
        const winId = this.electron.remote.getCurrentWindow().id;
        if (this.electron.remote.ipcMain.listenerCount(`ngx-electron-renderer-win-initialized-${winId}`)) {
            this.openerWindowId = +this.electron.ipcRenderer.sendSync(`ngx-electron-renderer-win-initialized-${winId}`);
        }
    }

    sendDataToWindowsByKeys<T>(data: T, ...keys: string[]) {
        if (this.isElectron) {
            const ids = keys.map(key => this.getWinIdByKey(key));
            this.sendDataToWindowsByIds<T>(data, ...ids);
        }
    }

    sendDataToWindowsByIds<T>(data: T, ...ids: number[]) {
        if (this.isElectron) {
            const wins = ids.map(id => this.electron.remote.BrowserWindow.fromId(id));
            this.sendDataToWindows<T>(data, ...wins);
        }
    }

    sendDataToAllWindows<T>(data: T) {
        if (this.isElectron) {
            const wins = this.electron.remote.BrowserWindow.getAllWindows();
            this.sendDataToWindows<T>(data, ...wins);
        }
    }

    sendDataToWindows<T>(data: T, ...wins: BrowserWindow[]) {
        if (this.isElectron) {
            wins.filter(win => !!win).forEach(win => win.webContents.send('ngx-electron-renderer-core-data', data));
        }
    }

    sendDataToOpenerWindow<T>(data: T) {
        if (this.isElectron && this.openerWindowId) {
            this.sendDataToWindowsByIds(data, this.openerWindowId);
        }
    }

    createWindow(options: BrowserWindowOptions): BrowserWindow | null {
        if (this.isElectron) {
            // 判断主进程是否加载所需文件
            const winId = this.getWinIdByKey(options.key);
            let win: BrowserWindow;
            if (winId) {
                win = this.electron.remote.BrowserWindow.fromId(winId);
                win.focus();
            } else {
                let parentWinId = options.parentId;
                if (parentWinId === undefined && options.parentKey) {
                    parentWinId = this.getWinIdByKey(options.parentKey);
                }
                if (parentWinId) {
                    options.parent = this.electron.remote.BrowserWindow.fromId(parentWinId);
                }
                win = new this.electron.remote.BrowserWindow({
                    show: false,
                    ...options
                });
                const httpUrl = this.isServe ? `http://${location.hostname}:${location.port}/#${options.path}` :
                    `${url.format({
                        pathname: path.join(this.electron.remote.app.getAppPath(),
                            'dist', this.electron.remote.app.getName(), 'index.html'),
                        protocol: 'file:',
                        slashes: true
                    })}#${options.path}`;
                console.log(`load url:${httpUrl}`);
                win.loadURL(httpUrl);
                if (this.isOpenDevTools) {
                    win.webContents.openDevTools();
                }
                if (options.key) {
                    this.electron.ipcRenderer.send('ngx-electron-renderer-win-created', options.key, win.id);
                }
                win.once('closed', () => {
                    if (options.key) {
                        this.electron.ipcRenderer.send('ngx-electron-renderer-win-destroyed', options.key);
                    }
                    win = null;
                });
                win.once('ready-to-show', () => win.show());
                this.electron.remote.ipcMain.on(`ngx-electron-renderer-win-initialized-${win.id}`, event => {
                    event.returnValue = this.electron.remote.getCurrentWindow().id;
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
                this.electron.ipcRenderer.on('ngx-electron-renderer-core-data',
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
        return this.isElectron && this.electron.ipcRenderer.sendSync('ngx-electron-renderer-get-win-id-by-key', key);
    }


    /**
     * 设置tray菜单
     * @param template 1
     */
    setTrayContextMenu(template: MenuItemConstructorOptions[]) {
        if (this.isElectron) {
            const timestamp = new Date().getTime();
            this.electron.ipcRenderer.on(`ngx-electron-click-tray-context-menu-item-${timestamp}`, (event, i) => {
                const item = template.find((value, index) => index === i);
                this.ngZone.run(() => setTimeout(() =>
                    item.click && item.click(null, null, null)));
            });
            // template.forEach(
            //     (currentValue, index) => this.ipcRenderer.on(`ngx-electron-click-tray-context-menu-item-${index}-${timestamp}`,
            //         () => this.ngZone.run(() => setTimeout(() => {
            //             debugger;
            //             currentValue.click && currentValue.click();
            //         }))));
            this.electron.ipcRenderer.send('ngx-electron-renderer-set-tray-context-menu', template, timestamp);
        }
    }

    /**
     * 检测更新
     */
    checkForUpdates() {
        if (this.isElectron) {
            console.log('************checkForUpdates START***************');
            this.electron.ipcRenderer.send('ngx-electron-check-for-updates');
            console.log('************checkForUpdates END***************');
        }
    }


    downloadUpdate(): void {
        if (this.isElectron) {
            console.log('************downloadUpdate START***************');
            this.electron.ipcRenderer.send('ngx-electron-download-update');
            console.log('************downloadUpdate END***************');
        }
    }

    quitAndInstall(): void {
        if (this.isElectron) {
            console.log('************quitAndInstall START***************');
            this.electron.ipcRenderer.send('ngx-electron-quit-and-install');
            console.log('************quitAndInstall END***************');
        }
    }

}

