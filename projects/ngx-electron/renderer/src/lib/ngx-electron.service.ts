import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    IpcMainEvent,
    IpcRendererEvent,
    Remote,
    RendererInterface,
    IpcRenderer
} from 'electron';
import * as electron from 'electron';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import {TrayProxy} from './tray-proxy';
import {AutoUpdaterProxy} from './auto-updater-proxy';
import {IpcRendererProxy} from './ipc-renderer-proxy';
import * as childProcess from 'child_process';
import {fromPromise} from 'rxjs/internal-compatibility';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {
    NgxElectronProxy,
    NgxElectronBrowserWindowProxy,
    NgxElectronBrowserWindowProxyConstructorOptions,
    isServe,
    port,
    host, ChannelsMap, openDevTools, isMac, isLinux, isWindows, NgxElectronIpcRendererProxy
} from '@ngx-electron/core';

export type BrowserWindowOptions = BrowserWindowConstructorOptions &
    {
        path: string;
        key?: string;
        parentKey?: string;
        parentId?: number;
        callback?: (event: IpcMainEvent) => void;
    };


@Injectable({
    providedIn: 'root'
})
export class NgxElectronService<T extends ChannelsMap = any> {

    openerBrowserWindow?: BrowserWindow;

    electron?: RendererInterface;

    remote?: Remote;

    ipcRenderer?: NgxElectronIpcRendererProxy<T>;

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
        return isServe;
    }

    get port(): string {
        return port;
    }

    get host(): string {
        return host;
    }

    get isOpenDevTools(): boolean {
        return openDevTools;
    }

    get isMac(): boolean {
        return isMac;
    }

    get isWindows(): boolean {
        return isWindows;
    }

    get isLinux(): boolean {
        return isLinux;
    }

    constructor(private router: Router,
                private httpClient: HttpClient,
                private ngZone: NgZone) {
        if (!this.isElectron) {
            return;
        }
        this.childProcess = childProcess;
        this.fs = fs;
        this.electron = electron;
        // this = NgxElectronProxy.instanceOf<T>(this.electron, this.ngZone);
        this.remote = this.electron.remote;
        this.tray = new TrayProxy(this.electron, this.remote.ipcRenderer, this.remote, this.ngZone);

        this.autoUpdater = new AutoUpdaterProxy(this.remote.ipcRenderer, this.remote);

        const winId = this.remote.getCurrentWindow().id;
        // if (this.remote.ipcMain.listenerCount(`ngx-electron-renderer-win-initialized-${winId}`)) {
        //     const openerWindowId = this.ipcRenderer.sendSync(`ngx-electron-renderer-win-initialized-${winId}`);
        //     this.openerBrowserWindow = this.remote.BrowserWindow.fromId(openerWindowId);
        // }
    }

    sendDataToWindowsByKeys(data: T, ...keys: string[]) {
        if (this.isElectron) {
            // const ids = keys.map(key => this.getWinIdByKey(key));
            // this.sendDataToWindowsByIds(data, ...ids);
        }
    }

    sendDataToWindowsByIds(data: T, ...ids: number[]) {
        if (this.isElectron) {
            const wins = ids.map(id => this.remote.BrowserWindow.fromId(id));
            this.sendDataToWindows(data, ...wins);
        }
    }

    sendDataToAllWindows(data: T) {
        if (this.isElectron) {
            const wins = this.remote.BrowserWindow.getAllWindows();
            this.sendDataToWindows(data, ...wins);
        }
    }

    sendDataToWindows(data: T, ...wins: BrowserWindow[]) {
        if (this.isElectron) {
            wins.filter(win => !!win).forEach(win => win.webContents.send('ngx-electron-renderer-core-data', data));
        }
    }

    sendDataToOpenerWindow(data: T) {
        if (this.isElectron && this.openerBrowserWindow) {
            this.sendDataToWindows(data, this.openerBrowserWindow);
        }
    }

    createWindow(options: NgxElectronBrowserWindowProxyConstructorOptions): NgxElectronBrowserWindowProxy {
        // return new NgxElectronBrowserWindowProxy(options);
        return null
        // if (this.isElectron) {
        //     // 判断主进程是否加载所需文件
        //     const winId = this.getWinIdByKey(options.key);
        //     let win: BrowserWindow;
        //     if (winId) {
        //         win = this.remote.BrowserWindow.fromId(winId);
        //         win.focus();
        //     } else {
        //         let parentWinId = options.parentId;
        //         if (parentWinId === undefined && options.parentKey) {
        //             parentWinId = this.getWinIdByKey(options.parentKey);
        //         }
        //         if (parentWinId) {
        //             options.parent = this.remote.BrowserWindow.fromId(parentWinId);
        //         }
        //         win = new this.remote.BrowserWindow({
        //             show: false,
        //             ...options
        //         });
        //         const httpUrl = this.isServe ? `http://${location.hostname}:${location.port}/#${options.path}` :
        //             `${url.format({
        //                 pathname: path.join(this.remote.app.getAppPath(),
        //                     'dist', this.remote.app.name, 'index.html'),
        //                 protocol: 'file:',
        //                 slashes: true
        //             })}#${options.path}`;
        //         console.log(`load url:${httpUrl}`);
        //         win.loadURL(httpUrl);
        //         if (this.isOpenDevTools) {
        //             win.webContents.openDevTools();
        //         }
        //         if (options.key) {
        //             this.remote.ipcRenderer.send('ngx-electron-renderer-win-created', options.key, win.id);
        //         }
        //         win.once('closed', () => {
        //             if (options.key) {
        //                 this.remote.ipcRenderer.send('ngx-electron-renderer-win-destroyed', options.key);
        //             }
        //             win = null;
        //         });
        //         win.once('ready-to-show', () => win.show());
        //         this.remote.ipcMain.on(`ngx-electron-renderer-win-initialized-${win.id}`, event => {
        //             event.returnValue = this.remote.getCurrentWindow().id;
        //             if (options.callback) {
        //                 options.callback(event);
        //             }
        //         });
        //     }
        //     return win;
        // }
        // return null;
    }

    /**
     * 获得其他窗口发送据 注意：数据在的数发送过程中json序列化 会去掉方法和原型
     * @return Observable
     */
    data(): Observable<{ event: IpcRendererEvent, data?: T }> {
        return new Observable<{ event: IpcRendererEvent, data?: T }>(observer => {
            if (this.isElectron) {
                this.remote.ipcRenderer.on('ngx-electron-renderer-core-data', (event, data) =>
                    this.ngZone.run(() => setTimeout(() => observer.next({event, data}))));
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
    // getWinIdByKey(key: any): number {
    //     return this.isElectron && this.ipcRenderer.sendSync<any>('ngx-electron-renderer-get-win-id-by-key', key);
    // }

    /**
     * 加载json数组从assets中加载
     * @param assetsPath json文件路径
     */
    loadJsonArrayFromAssets(assetsPath: string): Observable<T[]> {
        if (this.isServe || !this.isElectron) {
            return this.httpClient.get<T[]>(assetsPath);
        } else {
            // 使用import得到的json数组类型为 {[a in number]: T} 需要进行处理
            return fromPromise<{ [a in number]: T }>(import((`src/${assetsPath}`))).pipe(
                map<{ [a in number]: T }, T[]>(data => Object.keys(data).map(k => data[k]))
            );
        }
    }

    /**
     * 加载json文件从assets中加载
     * @param assetsPath json文件路径
     */
    loadJsonObjectFromAssets(assetsPath: string): Observable<T> {
        if (this.isServe || !this.isElectron) {
            return this.httpClient.get<T>(assetsPath);
        } else {
            return fromPromise<T>(import((`src/${assetsPath}`)));
        }
    }

}

