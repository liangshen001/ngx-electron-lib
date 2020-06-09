import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {ParentParams, TrayProxy} from './models';
import {BrowserWindow, BrowserWindowConstructorOptions, MenuItemConstructorOptions, RendererInterface} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';


// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.

@Injectable({
    providedIn: 'root'
})
export class ElectronService {

    electron?: RendererInterface;

    childProcess?: typeof childProcess;
    fs?: typeof fs;
    // 初始化得到的数据
    initData: any;

    isLoadElectronMain: boolean;

    private _tray: TrayProxy;

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

    get isServer(): boolean {
        return this.isElectron && this.electron.ipcRenderer.sendSync('ngx-electron-is-server');
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
        // Conditional imports
        if (!this.isElectron) {
            return;
        }
        this.electron = (window as any).require('electron');
        this.childProcess = (window as any).require('child_process');
        this.fs = (window as any).require('fs');

        if (!this.electron.remote.ipcMain.listenerCount('ngx-electron-load-electron-main')) {
            throw new Error('@ngx-electron/main is not imported in electron main');
        }
        this.electron.ipcRenderer.on('ngx-electron-core-init-data', (event, initData) => this.initData = initData);
    }

    createWindow(routerUrl: string, key: string, options: BrowserWindowConstructorOptions) {
        let win = new this.electron.remote.BrowserWindow({
            show: false,
            ...options
        });
        const httpUrl = this.isServer ? `http://${location.hostname}:${location.port}/#${routerUrl}` :
            `${url.format({
                pathname: path.join(this.electron.remote.app.getAppPath(),
                    'dist', this.electron.remote.app.getName(), 'index.html'),
                protocol: 'file:',
                slashes: true
            })}#${routerUrl}`;
        console.log(`加载url:${httpUrl}`);
        win.loadURL(httpUrl);
        if (this.isOpenDevTools) {
            win.webContents.openDevTools();
        }
        this.electron.ipcRenderer.send('ngx-electron-win-created', key, win.id);
        win.once('closed', () => {
            this.electron.ipcRenderer.send('ngx-electron-win-destroyed', key);
            win = null;
        });
        win.once('ready-to-show', () => win.show());
        return win;
    }

    sendDataToWindowsByKeys(data: any, keys: string[]) {
        if (this.isElectron) {
            const ids = keys.map(key => this.isLoadElectronMain && this.getWinIdByKey(key));
            this.sendDataToWindowsByIds(data, ids);
        }
    }

    sendDataToWindowsByIds(data: any, ids: number[]) {
        if (this.isElectron) {
            ids.map(id => this.electron.remote.BrowserWindow.fromId(id))
                .filter(win => !!win)
                .forEach(win => win.webContents.send('ngx-electron-core-data', data));
        }
    }

    sendDataToAllWindows(data: any) {
        this.electron.remote.BrowserWindow.getAllWindows()
            .forEach(win => win.webContents.send('ngx-electron-core-data', data));
    }

    /**
     * electron：新找开一个window加载routerUrl路由页面，web下 若webHandler参数为空，在此页面加载这个路由，若不空为无影响
     * web:加载这个路由
     * @param routerUrl 所加载的页面（electron/web）
     * @param options 加载electron window的参数 web下无影响
     * @param key 打开窗口的key 不可创建key值相同的窗口 默认和routerUrl相等 也就是说同样的路由只允许打开一次
     *              (在主进程中初始化ngx-electron-core-main此属性才有效)
     *              web下无影响
     * @param initData electron下window在被打开时初始化的数据 在新打开的窗口中使用ElectronService.initData获取
     *              数据会被json序列化，对象的方法和原型会被去除
     *              web下无影响
     * @param webHandler electron下无影响 web下的回调函数（默认行为加载routerUrl路由）
     * @param created win被创建
     * @param parentWinKey 父窗口key
     * @param parentWinId 父窗窗口id
     * @return 在electron下会返回 winId 在web下会返回 null
     */
    openPage(routerUrl: string, options: BrowserWindowConstructorOptions = {}, {
        key = routerUrl,
        initData,
        webHandler = () => this.router.navigateByUrl(routerUrl),
        created = () => {
        },
        parent
    }: {
        key?: string,
        initData?: any,
        webHandler?: () => void,
        created?: (win: BrowserWindow) => void,
        parent?: ParentParams
    } = {
        key: routerUrl,
        webHandler: () => this.router.navigateByUrl(routerUrl)
    }): BrowserWindow {
        if (this.isElectron) {
            // 判断主进程是否加载所需文件
            if (this.isLoadElectronMain) {
                const winId = this.getWinIdByKey(key);
                if (winId) {
                    const win = this.electron.remote.BrowserWindow.fromId(winId);
                    win.focus();
                    return win;
                }
            }
            if (parent) {
                let parentWinId;
                if (!parent.winId) {
                    parentWinId = this.getWinIdByKey(parent.winKey);
                }
                if (parentWinId) {
                    options.parent = this.electron.remote.BrowserWindow.fromId(parentWinId);
                }
            }
            const win2 = this.createWindow(routerUrl, key, options);
            if (created) {
                created(win2);
            }
            win2.once('ready-to-show', () =>
                win2.webContents.send('ngx-electron-core-init-data', initData));
            return win2;
        } else {
            webHandler();
            return null;
        }
    }

    /**
     * 获得其他窗口发送的数据 注意：数据在发送过程中json序列化 会去掉方法和原型
     * @return 数据
     */
    data(): Observable<any> {
        return new Observable(observer => {
            if (this.isElectron) {
                this.electron.ipcRenderer.on('ngx-electron-core-data',
                    (event, data) => this.ngZone.run(() => setTimeout(() => observer.next(data))));
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
    getWinIdByKey(key: string): number | null {
        return this.electron.ipcRenderer.sendSync('ngx-electron-get-win-id-by-key', key);
    }


    /**
     * 设置tray菜单
     * @param template 1
     */
    setTrayContextMenu(template: MenuItemConstructorOptions[]) {
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
        this.electron.ipcRenderer.send('ngx-electron-set-tray-context-menu', template, timestamp);
    }

    /**
     * 检测更新
     */
    checkForUpdates() {
        console.log('************checkForUpdates START***************');
        this.electron.ipcRenderer.send('ngx-electron-check-for-updates');
        console.log('************checkForUpdates END***************');
    }


    downloadUpdate(): void {
        console.log('************downloadUpdate START***************');
        this.electron.ipcRenderer.send('ngx-electron-download-update');
        console.log('************downloadUpdate END***************');
    }

    quitAndInstall(): void {
        console.log('************quitAndInstall START***************');
        this.electron.ipcRenderer.send('ngx-electron-quit-and-install');
        console.log('************quitAndInstall END***************');
    }

}

