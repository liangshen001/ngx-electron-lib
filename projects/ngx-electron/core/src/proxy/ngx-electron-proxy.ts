import {
    BrowserView,
    BrowserWindow,
    BrowserWindowProxy, CommandLine,
    CommonInterface, Cookies, Dock, DownloadItem,
    MainInterface, Menu, MenuItem, NativeImage,
    RendererInterface, TouchBar, TouchBarButton,
    TouchBarColorPicker,
    TouchBarGroup, TouchBarLabel, TouchBarPopover, TouchBarScrubber, TouchBarSegmentedControl, TouchBarSlider,
    TouchBarSpacer, Tray,
    WebContents, WebRequest, ClientRequest, Debugger, IncomingMessage, Session, Notification, Remote
} from 'electron';

import {NgZone} from '@angular/core';
import {NgxElectronBrowserWindowProxyContext} from './browser-window/ngx-electron-browser-window-proxy-context';
import {ChannelsMap} from './ipc/ngx-electron-ipc-proxy';
import {
    NgxElectronBrowserWindowProxy, NgxElectronBrowserWindowProxyConstructor
} from './browser-window/ngx-electron-browser-window-proxy';
import {NgxElectronIpcMainProxy} from './ipc-main/ngx-electron-ipc-main-proxy';
import {NgxElectronIpcRendererProxy} from './ipc-renderer/ngx-electron-ipc-renderer-proxy';
import {NgxElectronCommonInterfaceProxy} from './common-interface/ngx-electron-common-interface-proxy';
import {NgxElectronAppProxy} from './app/ngx-electron-app-proxy';
import {NgxElectronAppProxyContext} from './app/ngx-electron-app-proxy-context';
import {NgxElectronIpcMainProxyContext} from './ipc-main/ngx-electron-ipc-main-proxy-context';
import {NgxElectronIpcRendererProxyContext} from './ipc-renderer/ngx-electron-ipc-renderer-proxy-context';
import {NgxElectronRemoteProxyContext} from './remote/ngx-electron-remote-proxy-context';
import {NgxElectronRemoteProxy} from './remote/ngx-electron-remote-proxy';

/**
 * 核心代码
 * 代理 ipc，ElectronBrowserWindow
 */
export class NgxElectronProxy<T extends ChannelsMap> implements NgxElectronCommonInterfaceProxy {

    private constructor(electron: CommonInterface) {
        this.app = NgxElectronAppProxyContext.proxy<T>(this, electron.app);
        this.ipcMain = NgxElectronIpcMainProxyContext.proxy<T>(this, electron.ipcMain);
        this.ipcRenderer = NgxElectronIpcRendererProxyContext.proxy<T>(this, electron.ipcRenderer);
        this.BrowserWindow = NgxElectronBrowserWindowProxyContext.proxy<T>(this, electron.BrowserWindow);
        this.remote = NgxElectronRemoteProxyContext.proxy<T>(this, electron.remote);
    }
    private static instance : NgxElectronProxy<any>;

    BrowserView: typeof BrowserView;
    BrowserWindow: NgxElectronBrowserWindowProxyConstructor;
    BrowserWindowProxy: typeof BrowserWindowProxy;
    ClientRequest: typeof ClientRequest;
    CommandLine: typeof CommandLine;
    Cookies: typeof Cookies;
    Debugger: typeof Debugger;
    Dock: typeof Dock;
    DownloadItem: typeof DownloadItem;
    IncomingMessage: typeof IncomingMessage;
    Menu: typeof Menu;
    MenuItem: typeof MenuItem;
    Notification: typeof Notification;
    TouchBar: typeof TouchBar;
    TouchBarButton: typeof TouchBarButton;
    TouchBarColorPicker: typeof TouchBarColorPicker;
    TouchBarGroup: typeof TouchBarGroup;
    TouchBarLabel: typeof TouchBarLabel;
    TouchBarPopover: typeof TouchBarPopover;
    TouchBarScrubber: typeof TouchBarScrubber;
    TouchBarSegmentedControl: typeof TouchBarSegmentedControl;
    TouchBarSlider: typeof TouchBarSlider;
    TouchBarSpacer: typeof TouchBarSpacer;
    Tray: typeof Tray;
    WebRequest: typeof WebRequest;
    app: NgxElectronAppProxy;
    autoUpdater: Electron.AutoUpdater;
    clipboard: Electron.Clipboard;
    contentTracing: Electron.ContentTracing;
    contextBridge: Electron.ContextBridge;
    crashReporter: Electron.CrashReporter;
    desktopCapturer: Electron.DesktopCapturer;
    dialog: Electron.Dialog;
    globalShortcut: Electron.GlobalShortcut;
    inAppPurchase: Electron.InAppPurchase;
    ipcMain: NgxElectronIpcMainProxy<T>;
    ipcRenderer: NgxElectronIpcRendererProxy<T>;
    nativeImage: typeof NativeImage;
    nativeTheme: Electron.NativeTheme;
    net: Electron.Net;
    netLog: Electron.NetLog;
    powerMonitor: Electron.PowerMonitor;
    powerSaveBlocker: Electron.PowerSaveBlocker;
    protocol: Electron.Protocol;
    remote: NgxElectronRemoteProxy & Remote;
    screen: Electron.Screen;
    session: typeof Session;
    shell: Electron.Shell;
    systemPreferences: Electron.SystemPreferences;
    webContents: typeof WebContents;
    webFrame: Electron.WebFrame;
    webviewTag: Electron.WebviewTag;

    public static instanceOf<T extends ChannelsMap>(electron: CommonInterface, ngZone?: NgZone): NgxElectronProxy<T> {
        if (!this.instance) {
            this.instance = new NgxElectronProxy<T>(electron);
        }
        return this.instance;
    }

    // /**
    //  * 代理主进程
    //  */
    // public static proxy<T extends ChannelsMap>(electron: MainInterface): {
    //     ipc: NgxElectronIpcMainProxy<T>,
    //     ElectronBrowserWindow: typeof NgxElectronBrowserWindowProxy
    // };
    // /**
    //  * 代理渲染进程
    //  */
    // public static proxy<T extends ChannelsMap>(electron: RendererInterface, ngZone: NgZone): {
    //     ipc: NgxElectronIpcRendererProxy<T>,
    //     ElectronBrowserWindow: typeof NgxElectronBrowserWindowProxy
    // };
    // public static proxy<T extends ChannelsMap>(electron: CommonInterface, ngZone?: NgZone): {
    //     ipc: NgxElectronIpcMainProxy<T> | NgxElectronIpcRendererProxy<T>,
    //     ElectronBrowserWindow: typeof NgxElectronBrowserWindowProxy
    // } {
    //     // if (!this.cacheProxy) {
    //     //     const isRenderer = !!ngZone;
    //     //     // 对ipc进行代理
    //     //     const ipcProxy = NgxElectronIpcProxyUtil.proxy<T>(isRenderer ? electron.ipcRenderer : electron.ipcMain, ngZone);
    //     //     // 对创建的窗口进行代理
    //     //     const ElectronBrowserWindowProxy = NgxElectronBrowserWindowProxyContext.proxy<T>(ipcProxy, ngZone);
    //     //     this.cacheProxy = {
    //     //         ipc: ipcProxy,
    //     //         ElectronBrowserWindow: ElectronBrowserWindowProxy
    //     //     };
    //     // }
    //     return this.cacheProxy;
    // }
}
