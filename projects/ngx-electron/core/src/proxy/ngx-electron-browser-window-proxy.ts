import {
    app,
    BrowserWindow,
    BrowserWindowConstructorOptions,
    CommonInterface,
    IpcMainEvent,
    IpcRendererEvent
} from 'electron';
import * as electron from 'electron';
import {IpcProxy} from './ipc-proxy';
import {NgZone} from '@angular/core';
import * as path from 'path';
import * as url from 'url';
import {commonInterface, isRenderer} from '../utils/utils';
import {Observable} from 'rxjs';
import {host, isServe, openDevTools, port} from '../utils/electron-main-args-utils';


export interface NgxElectronBrowserWindowProxyConstructorOptions extends BrowserWindowConstructorOptions {
    ngxPath?: string;
    ngxInitCallback?: (event: IpcMainEvent | IpcRendererEvent) => void;
}

export interface NgxElectronBrowserWindowProxy extends BrowserWindow {

    new(options?: NgxElectronBrowserWindowProxyConstructorOptions): NgxElectronBrowserWindowProxy;

    /**
     * Emitted when the window is set or unset to show always on top of other windows.
     */
    onAlwaysOnTopChanged: Observable<{ event: Event; isAlwaysOnTop: boolean }>;
    onceAlwaysOnTopChanged: Observable<{ event: Event; isAlwaysOnTop: boolean }>;
    /**
     * Emitted when an App Command is invoked. These are typically related to keyboard
     * media keys or browser commands, as well as the "Back" button built into some
     * mice on Windows.
     *
     * Commands are lowercased, underscores are replaced with hyphens, and the
     * `APPCOMMAND_` prefix is stripped off. e.g. `APPCOMMAND_BROWSER_BACKWARD` is
     * emitted as `browser-backward`.
     *
     * The following app commands are explicitly supported on Linux:
     *
     * `browser-backward`
     * `browser-forward`
     *
     * @platform win32,linux
     */
    onAppCommand: Observable<{ event: Event; command: string }>;
    onceAppCommand: Observable<{ event: Event; command: string }>;
    /**
     * Emitted when the window loses focus.
     */
    onBlur: Observable<void>;
    onceBlur: Observable<void>;
    /**
     * Emitted when the window is going to be closed. It's emitted before the
     * `beforeunload` and `unload` event of the DOM. Calling `event.preventDefault()`
     * will cancel the close.
     *
     * Usually you would want to use the `beforeunload` handler to decide whether the
     * window should be closed, which will also be called when the window is reloaded.
     * In Electron, returning any value other than `undefined` would cancel the close.
     * For example:
     *
     * _**Note**: There is a subtle difference between the behaviors of
     * `window.onbeforeunload = handler` and `window.addEventListener('beforeunload',
     * handler)`. It is recommended to always set the `event.returnValue` explicitly,
     * instead of only returning a value, as the former works more consistently within
     * Electron._
     */
    onClose: Observable<{ event: Event }>;
    onceClose: Observable<{ event: Event }>;
    /**
     * Emitted when the window is closed. After you have received this event you should
     * remove the reference to the window and avoid using it any more.
     */
    onClosed: Observable<void>;
    onceClosed: Observable<void>;
    /**
     * Emitted when the window enters a full-screen state.
     */
    onEnterFullScreen: Observable<void>;
    onceEnterFullScreen: Observable<void>;
    /**
     * Emitted when the window enters a full-screen state triggered by HTML API.
     */
    onEnterHtmlFullScreen: Observable<void>;
    onceEnterHtmlFullScreen: Observable<void>;
    /**
     * Emitted when the window gains focus.
     */
    onFocus: Observable<void>;
    onceFocus: Observable<void>;
    /**
     * Emitted when the window is hidden.
     */
    onHide: Observable<void>;
    onceHide: Observable<void>;
    /**
     * Emitted when the window leaves a full-screen state.
     */
    onLeaveFullScreen: Observable<void>;
    onceLeaveFullScreen: Observable<void>;
    /**
     * Emitted when the window leaves a full-screen state triggered by HTML API.
     */
    onLeaveHtmlFullScreen: Observable<void>;
    onceLeaveHtmlFullScreen: Observable<void>;
    /**
     * Emitted when window is maximized.
     */
    onMaximize: Observable<void>;
    onceMaximize: Observable<void>;
    /**
     * Emitted when the window is minimized.
     */
    onMinimize: Observable<void>;
    onceMinimize: Observable<void>;
    /**
     * Emitted when the window is being moved to a new position.
     *
     * __Note__: On macOS this event is an alias of `moved`.
     */
    onMove: Observable<void>;
    onceMove: Observable<void>;
    /**
     * Emitted once when the window is moved to a new position.
     *
     * @platform darwin
     */
    onMoved: Observable<void>;
    onceMoved: Observable<void>;
    /**
     * Emitted when the native new tab button is clicked.
     *
     * @platform darwin
     */
    onNewWindowForTab: Observable<void>;
    onceNewWindowForTab: Observable<void>;
    /**
     * Emitted when the document changed its title, calling `event.preventDefault()`
     * will prevent the native window's title from changing. `explicitSet` is false
     * when title is synthesized from file URL.
     */
    onPageTitleUpdated: Observable<void>;
    oncePageTitleUpdated: Observable<void>;
    /**
     * Emitted when the web page has been rendered (while not being shown) and window
     * can be displayed without a visual flash.
     *
     * Please note that using this event implies that the renderer will be considered
     * "visible" and paint even though `show` is false.  This event will never fire if
     * you use `paintWhenInitiallyHidden: false`
     */
    onReadyToShow: Observable<void>;
    onceReadyToShow: Observable<void>;
    /**
     * Emitted after the window has been resized.
     */
    onResize: Observable<void>;
    onceResize: Observable<void>;
    /**
     * Emitted when the unresponsive web page becomes responsive again.
     */
    onResponsive: Observable<void>;
    onceResponsive: Observable<void>;
    /**
     * Emitted when the window is restored from a minimized state.
     */
    onRestore: Observable<void>;
    onceRestore: Observable<void>;
    /**
     * Emitted on trackpad rotation gesture. Continually emitted until rotation gesture
     * is ended. The `rotation` value on each emission is the angle in degrees rotated
     * since the last emission. The last emitted event upon a rotation gesture will
     * always be of value `0`. Counter-clockwise rotation values are positive, while
     * clockwise ones are negative.
     *
     * @platform darwin
     */
    onRotateGesture: Observable<{ event: Event; rotation: number }>;
    onceRotateGesture: Observable<{ event: Event; rotation: number }>;
    /**
     * Emitted when scroll wheel event phase has begun.
     *
     * @platform darwin
     */
    onScrollTouchBegin: Observable<void>;
    onceScrollTouchBegin: Observable<void>;
    /**
     * Emitted when scroll wheel event phase filed upon reaching the edge of element.
     *
     * @platform darwin
     */
    onScrollTouchEdge: Observable<void>;
    onceScrollTouchEdge: Observable<void>;
    /**
     * Emitted when scroll wheel event phase has ended.
     *
     * @platform darwin
     */
    onScrollTouchEnd: Observable<void>;
    onceScrollTouchEnd: Observable<void>;
    /**
     * Emitted when window session is going to end due to force shutdown or machine
     * restart or session log off.
     *
     * @platform win32
     */
    onSessionEnd: Observable<void>;
    onceSessionEnd: Observable<void>;
    /**
     * Emitted when the window opens a sheet.
     *
     * @platform darwin
     */
    onSheetBegin: Observable<void>;
    onceSheetBegin: Observable<void>;
    /**
     * Emitted when the window has closed a sheet.
     *
     * @platform darwin
     */
    onSheetEnd: Observable<void>;
    onceSheetEnd: Observable<void>;
    /**
     * Emitted when the window is shown.
     */
    onShow: Observable<void>;
    onceShow: Observable<void>;
    /**
     * Emitted on 3-finger swipe. Possible directions are `up`, `right`, `down`,
     * `left`.
     *
     * @platform darwin
     */
    onSwipe: Observable<{ event: Event, direction: string }>;
    onceSwipe: Observable<{ event: Event, direction: string }>;
    /**
     * Emitted when the window exits from a maximized state.
     */
    onUnmaximize: Observable<void>;
    onceUnmaximize: Observable<void>;
    /**
     * Emitted when the web page becomes unresponsive.
     */
    onUnresponsive: Observable<void>;
    onceUnresponsive: Observable<void>;
    /**
     * Emitted before the window is moved. Calling `event.preventDefault()` will
     * prevent the window from being moved.
     *
     * Note that this is only emitted when the window is being resized manually.
     * Resizing the window with `setBounds`/`setSize` will not emit this event.
     *
     * @platform win32
     */
    onWillMove: Observable<{
        event: Event,
        /**
         * Location the window is being moved to.
         */
        newBounds: electron.Rectangle
    }>;
    onceWillMove: Observable<{
        event: Event,
        /**
         * Location the window is being moved to.
         */
        newBounds: electron.Rectangle
    }>;
    /**
     * Emitted before the window is resized. Calling `event.preventDefault()` will
     * prevent the window from being resized.
     *
     * Note that this is only emitted when the window is being resized manually.
     * Resizing the window with `setBounds`/`setSize` will not emit this event.
     *
     * @platform darwin,win32
     */
    onWillResize: Observable<{
        event: Event,
        /**
         * Location the window is being moved to.
         */
        newBounds: electron.Rectangle
    }>;
    onceWillResize: Observable<{
        event: Event,
        /**
         * Location the window is being moved to.
         */
        newBounds: electron.Rectangle
    }>;
}
export let NgxElectronBrowserWindowProxy;

export class NgxElectronBrowserWindowProxyUtil {


    /**
     * 代理BrowserWindow
     */
    public static proxy(ngZone?: NgZone) {

        if (!isRenderer) {
            electron.ipcMain.on('ngx-electron-renderer-win-created', () => {

            });
            electron.ipcMain.on('ngx-electron-renderer-win-destroyed', () => {

            });
        }
        debugger;
        NgxElectronBrowserWindowProxy = new Proxy(commonInterface.BrowserWindow, {
            construct(target: any, argArray: [NgxElectronBrowserWindowProxyConstructorOptions]) : NgxElectronBrowserWindowProxy {
                let options = argArray[0] || {};
                const win = new target(options);

                const events = ['always-on-top-changed', 'app-command', 'blur', 'close', 'closed', 'enter-full-screen', 'enter-html-full-screen', 'focus', 'hide', 'leave-full-screen', 'leave-html-full-screen', 'maximize',
                    'minimize', 'move', 'moved', 'new-window-for-tab', 'page-title-updated', 'ready-to-show', 'resize', 'responsive', 'restore', 'rotate-gesture', 'scroll-touch-begin', 'scroll-touch-edge', 'scroll-touch-end',
                    'session-end', 'sheet-begin', 'sheet-end', 'swipe', 'unmaximize', 'unresponsive', 'will-move', 'will-resize'];
                NgxElectronBrowserWindowProxyUtil.definedObservables(win, events, 'event', 'isAlwaysOnTop', 'command', 'rotation', 'direction', 'newBounds');

                if (!isRenderer) {
                    // 给主进程中webContents添加发送回调函数的功能
                    IpcProxy.proxyIpcSender(win.webContents, ngZone);
                }
                // 加载指定路由
                const ngxPath = options.ngxPath || '';
                console.log(`create windows use routerUrl：${ngxPath}`);
                if (isServe) {
                    const loadUrl = `http://${host}:${port}/#${ngxPath}`;
                    console.log(`load url：${loadUrl}`);
                    win.loadURL(loadUrl);
                } else {
                    const pathname = path.join(app.getAppPath(), `/dist/${app.name}/index.html`);
                    console.log(`create locale file pathname:${pathname}#${ngxPath}`);
                    win.loadURL(url.format({
                        pathname,
                        protocol: 'file:',
                        slashes: true
                    }) + `#${ngxPath}`);
                    win.webContents.reloadIgnoringCache();
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
                    win.webContents.openDevTools();
                }
                if (isRenderer) {
                    electron.remote.ipcMain.on(`ngx-electron-renderer-win-initialized-${win.id}`, event => {
                        console.log(electron.remote.getCurrentWindow().id);
                        event.returnValue = electron.remote.getCurrentWindow().id;
                        debugger;
                        if (options && options.ngxInitCallback) {
                            options.ngxInitCallback(event);
                        }
                    });
                } else {
                }
                win.on('focus', () => {
                    if (isRenderer) {
                        electron.ipcRenderer.sendSync('ngx-electron-renderer-focus-window-id', win.id);
                    } else {
                        this.currentWindowId = win.id;
                    }
                });
                return win;
            },
        });
    }

    private static definedObservables(target: BrowserWindow, events: string[], ...argNames: string[]) {
        events.forEach(event => {
            const name = `-${event}`.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
            [target[`on${name}`], target[`once${name}`]] = this.newObservables(target, event, ...argNames);
        })
    }



    /**
     * 创建可响应对象
     */
    private static newObservable<T, P extends keyof T>(target: BrowserWindow, type: 'on' | 'once', event: string | any, ...argNames: P[]) {
        const isOn = type === 'on';
        return new Observable<T>(subscriber => {
            const callback = (...args: any[]) => {
                subscriber.next(argNames.reduce((p, v, i) => ({
                    ...p,
                    [v]: args[i]
                }), {} as T));
                if (isOn) {
                    subscriber.complete();
                }
            };
            target[type](event, callback);
            if (isOn) {
                return () => target.removeListener(event, callback);
            }
        });
    }

    /**
     * 创建一对 可响应对象 第一个不关闭的流  第二个只发射一次关闭的流
     */
    private static newObservables<T, P extends keyof T>(target: BrowserWindow, event: string | any, ...argNames: any[]) {
        return [
            this.newObservable<T, P>(target, 'on', event, ...argNames),
            this.newObservable<T, P>(target, 'once', event, ...argNames)
        ];
    }
}


