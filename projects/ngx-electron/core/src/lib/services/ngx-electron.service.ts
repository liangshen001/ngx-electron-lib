import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {ParentParams, TrayProxy} from '../models';
import {IpcRenderer, WebFrame, Remote, BrowserWindowConstructorOptions, MenuItemConstructorOptions, BrowserWindow} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.

@Injectable({
    providedIn: 'root'
})
export class NgxElectronService {

    ipcRenderer: IpcRenderer;
    webFrame: WebFrame;
    remote: Remote;

    childProcess: typeof childProcess;
    fs: typeof fs;

    defaultWinOptions = {
        hasShadow: true,
        frame: false,
        transparent: true,
        show: false,
        width: 500,
        height: 500
    };
    // 初始化得到的数据
    initData: any;

    isLoadElectronMain: boolean;

    _tray: TrayProxy;

    get tray() {
        if (this._tray) {
            return this._tray;
        } else if (this.isElectron() && this.remote.ipcMain.listenerCount('ngx-electron-tray-created')) {
            this._tray = {
                on: (event: string, listener: any) => {
                    const timestamp = new Date().getTime();
                    this.ipcRenderer.on(`ngx-electron-tray-on-${event}-${timestamp}`, listener);
                    this.ipcRenderer.send(`ngx-electron-tray-on-event`, event, timestamp);
                },
                once: (event: string, listener: any) => {
                    const timestamp = new Date().getTime();
                    this.ipcRenderer.on(`ngx-electron-tray-once-${event}-${timestamp}`, listener);
                    this.ipcRenderer.send(`ngx-electron-tray-once-event`, event, timestamp);
                },
                destroy: () => this.ipcRenderer.send('ngx-electron-tray-apply-method', 'destroy'),
                setHighlightMode: (mode: string) => this.ipcRenderer.send('ngx-electron-tray-apply-method', 'setHighlightMode', mode),
                setTitle: (title) => this.ipcRenderer.send('ngx-electron-tray-apply-method', 'setTitle', title),
                setToolTip: toolTip => this.ipcRenderer.send('ngx-electron-tray-apply-method', 'setToolTip', toolTip),
                setImage: (image, isWeb) => this.ipcRenderer.send('ngx-electron-tray-apply-method', 'setImage', image, isWeb),
                setContextMenuTemplate: this.setTrayContextMenu.bind(this)
            };
            return this._tray;
        } else {
            return null;
        }
    }

    constructor(private router: Router,
                private ngZone: NgZone) {
        // Conditional imports
        if (!this.isElectron()) {
            return;
        }
        this.ipcRenderer = window['require']('electron').ipcRenderer;
        this.webFrame = window['require']('electron').webFrame;
        this.remote = window['require']('electron').remote;
        this.childProcess = window['require']('child_process');
        this.fs = window['require']('fs');

        this.isLoadElectronMain = !!this.remote.ipcMain.listenerCount('ngx-electron-load-electron-main');
        this.ipcRenderer.on('ngx-electron-core-init-data', (event, initData) => this.initData = initData);
    }

    /**
     * 判断是否加载了@ngx-electron/electron-main模块
     */
    isElectron(): boolean {
        return !!window.navigator.userAgent.match(/Electron/);
    }

    createWindow(routerUrl: string, key: string, options: BrowserWindowConstructorOptions) {
        let win = new this.remote.BrowserWindow({
            ...this.defaultWinOptions,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false
            },
            ...options
        });
        const url = this.isServer() ? `http://${location.hostname}:${location.port}/#${routerUrl}` :
            `${window['require']('url').format({
                pathname: window['require']('path').join(this.remote.app.getAppPath(),
                    'dist', this.remote.app.getName(), 'index.html'),
                protocol: 'file:',
                slashes: true
            })}#${routerUrl}`;
        console.log(`加载url:${url}`);
        win.loadURL(url);
        if (this.isOpenDevTools()) {
            win.webContents.openDevTools();
        }
        if (this.isLoadElectronMain) {
            this.ipcRenderer.send('ngx-electron-win-created', key, win.id);
            win.once('closed', () => {
                this.ipcRenderer.send('ngx-electron-win-destroyed', key);
                win = null;
            });
        }
        win.once('ready-to-show', () => win.show());
        return win;
    }

    sendDataByWindowKeys(data: any, ...keys: string[]) {
        this.send(data, ...keys);
    }

    sendDataByWindowIds(data: any, ...ids: number[]) {
        this.send(data, ...ids);
    }

    send(data: any, ...ids: number[]);

    send(data: any, ...keys: string[]);

    send(data: any, ...idKeys: any[]) {
        if (this.isElectron()) {
            console.log(`发送数据 data:${data}`);
            if (idKeys && idKeys.length) {
                idKeys.filter(idKey => !!idKey)
                    .map(idKey => {
                        console.log(`接收数据data 类型${typeof idKey} win ${idKey}`);
                        switch (typeof idKey) {
                            case 'string':
                                return this.isLoadElectronMain && this.getWinIdByKey(idKey);
                            case 'number':
                                return idKey;
                            default:
                                return null;
                        }
                    })
                    .filter(id => !!id)
                    .map(id => this.remote.BrowserWindow.fromId(id))
                    .filter(win => !!win)
                    .forEach(win => win.webContents.send('ngx-electron-core-data', data));
            } else {
                this.remote.BrowserWindow.getAllWindows()
                    .forEach(win => win.webContents.send('ngx-electron-core-data', data));
            }
        }
    }

    /**
     * electron：新找开一个window加载routerUrl路由页面，web下 若webHandler参数为空，在此页面加载这个路由，若不空为无影响
     * web:加载这个路由
     * @param routerUrl 所加载的页面（electron/web）
     * @param options 加载electron window的参数 web下无影响
     * @param key 打开窗口的key 不可创建key值相同的窗口 默认和routerUrl相等 也就是说同样的路由只允许打开一次
     *              (在主进程中初始化ngx-electron-core-main此属性才有效)
     *              web下无影响
     * @param initData electron下window在被打开时初始化的数据 在新打开的窗口中使用NgxElectronService.initData获取
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
        if (this.isElectron()) {
            // 判断主进程是否加载所需文件
            if (this.isLoadElectronMain) {
                const winId = this.getWinIdByKey(key);
                if (winId) {
                    const win = this.remote.BrowserWindow.fromId(winId);
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
                    options.parent = this.remote.BrowserWindow.fromId(parentWinId);
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
        return Observable.create(observer => {
            if (this.isElectron()) {
                this.ipcRenderer.on('ngx-electron-core-data',
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
        return this.ipcRenderer.sendSync('ngx-electron-get-win-id-by-key', key);
    }

    isServer() {
        return this.isElectron() && this.ipcRenderer.sendSync('ngx-electron-is-server');
    }

    isOpenDevTools() {
        return this.isElectron() && this.ipcRenderer.sendSync('ngx-electron-is-open-dev-tools');
    }

    getPort() {
        return this.isElectron() && this.ipcRenderer.sendSync('ngx-electron-get-port');
    }

    getHost() {
        return this.isElectron() && this.ipcRenderer.sendSync('ngx-electron-get-host');
    }

    isMac() {
        return this.isElectron() && this.ipcRenderer.sendSync('ngx-electron-is-mac');
    }

    isWindows() {
        return this.isElectron() && this.ipcRenderer.sendSync('ngx-electron-is-windows');
    }

    isLinux() {
        return this.isElectron() && this.ipcRenderer.sendSync('ngx-electron-is-linux');
    }

    /**
     * 设置tray菜单
     * @param template 1
     */
    setTrayContextMenu(template: MenuItemConstructorOptions[]) {
        const timestamp = new Date().getTime();
        this.ipcRenderer.on(`ngx-electron-click-tray-context-menu-item-${timestamp}`, (event, i) => {
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
        this.ipcRenderer.send('ngx-electron-set-tray-context-menu', template, timestamp);
    }

    /**
     * 检测更新
     */
    checkForUpdates() {
        console.log('************checkForUpdates START***************');
        this.ipcRenderer.send('ngx-electron-check-for-updates');
        console.log('************checkForUpdates END***************');
    }


    downloadUpdate(): void {
        console.log('************downloadUpdate START***************');
        this.ipcRenderer.send('ngx-electron-download-update');
        console.log('************downloadUpdate END***************');
    }

    quitAndInstall(): void {
        console.log('************quitAndInstall START***************');
        this.ipcRenderer.send('ngx-electron-quit-and-install');
        console.log('************quitAndInstall END***************');
    }

}

