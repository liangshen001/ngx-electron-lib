import {BrowserWindow} from 'electron';
import * as path from 'path';
import * as url from 'url';
import {host, isRenderer, isServe, openDevTools, port} from '../../utils/utils';
import {
    NgxElectronBrowserWindowProxy,
    NgxElectronBrowserWindowProxyConstructor
} from './ngx-electron-browser-window-proxy';
import {ObservableUtil} from '../../utils/observable-util';
import {NgxElectronProxy} from '../ngx-electron-proxy';
import {ChannelsMap} from '../ipc/ngx-electron-ipc-proxy';


/**
 * 对BrowserWindow进行代理
 * NgxElectronBrowserWindowProxyContext.proxy();
 */
export class NgxElectronBrowserWindowProxyContext {

    /**
     * 代理BrowserWindow
     */
    public static proxy<T extends ChannelsMap>(electron: NgxElectronProxy<T>, browserWindow: typeof BrowserWindow): NgxElectronBrowserWindowProxyConstructor {
        if (!browserWindow) {
            return;
        }
        return new Proxy(browserWindow, {
            construct(target: typeof BrowserWindow, argArray: any, newTarget?: any): NgxElectronBrowserWindowProxy {
                const options = argArray[0] || {};
                const obj = Reflect.construct(target, argArray, newTarget);
                // 加载指定路由
                const ngxPath = options.ngxPath || '';
                console.log(`create windows use routerUrl：${ngxPath}`);
                if (isServe) {
                    const loadUrl = `http://${host}:${port}/#${ngxPath}`;
                    console.log(`load url：${loadUrl}`);
                    obj.loadURL(loadUrl);
                } else {
                    const pathname = path.join(electron.app.getAppPath(), `/dist/${electron.app.name}/index.html`);
                    console.log(`create locale file pathname:${pathname}#${ngxPath}`);
                    obj.loadURL(url.format({
                        pathname,
                        protocol: 'file:',
                        slashes: true
                    }) + `#${ngxPath}`);
                    obj.webContents.reloadIgnoringCache();
                }
                // if (options.key) {
                //     if (isRenderer) {
                //         electron.ipcRenderer.send('ngx-electron-renderer-win-created', options.key, win.id);
                //     } else {
                //         winIdMap.set(options.key, win.id);
                //     }
                // }
                if (isServe || openDevTools) {
                    console.log(`openDevTools：${isServe || openDevTools}`);
                    obj.webContents.openDevTools();
                }
                if (isRenderer) {
                    electron.ipcMain.onChannel(`ngx-electron-renderer-win-initialized-${obj.id}`).subscribe(data => {
                        console.log(electron.remote.getCurrentWindow().id);
                        data.event.returnValue = electron.remote.getCurrentWindow().id;
                        if (options && options.ngxInitCallback) {
                            options.ngxInitCallback(event);
                        }
                    });
                    // electron.remote.ipcMain.on(`ngx-electron-renderer-win-initialized-${obj.id}`, event => {
                    //     console.log(electron.remote.getCurrentWindow().id);
                    //     event.returnValue = electron.remote.getCurrentWindow().id;
                    //     if (options && options.ngxInitCallback) {
                    //         options.ngxInitCallback(event);
                    //     }
                    // });
                }

                obj.onBlur = ObservableUtil.newObservable(obj, 'on', 'blur')
                obj.onFocus = ObservableUtil.newObservable(obj, 'on', 'focus')
                obj.onFocus.subscribe(() => {
                    if (isRenderer) {
                        // NgxElectronBrowserWindowProxyContext.ipcRendererProxy.sendSync('ngx-electron-renderer-focus-window-id', this.id);
                    } else {
                        // this.currentWindowId = this.id;
                    }
                });
                return obj;
            }
        }) as NgxElectronBrowserWindowProxyConstructor;
    }

}


