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
    WebContents, WebRequest, ClientRequest, Debugger, IncomingMessage, Session, Notification
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

export class NgxElectronRendererProcessService<T extends ChannelsMap> {
    clipboard: Electron.Clipboard;
    crashReporter: Electron.CrashReporter;
    nativeImage: typeof NativeImage;
    shell: Electron.Shell;
    screen: Electron.Screen;


    remote: Electron.Remote;
    desktopCapturer: Electron.DesktopCapturer;
    ipcRenderer: Electron.IpcRenderer;
    webFrame: Electron.WebFrame;
    dialog: Electron.Dialog;
    ipcMain: Electron.IpcMain;


    app: NgxElectronAppProxy;
    autoUpdater: Electron.AutoUpdater;
    BrowserWindow: typeof BrowserWindow;
    contentTracing: Electron.ContentTracing;
    globalShortcut: Electron.GlobalShortcut;
    Menu: typeof Menu;
    MenuItem: typeof MenuItem;
    powerSaveBlocker: Electron.PowerSaveBlocker;
    protocol: Electron.Protocol;
    session: typeof Session;
    systemPreferences: Electron.SystemPreferences;
    Tray: typeof Tray;


    BrowserView: typeof BrowserView;
    BrowserWindowProxy: typeof BrowserWindowProxy;
    ClientRequest: typeof ClientRequest;
    CommandLine: typeof CommandLine;
    Cookies: typeof Cookies;
    Debugger: typeof Debugger;
    Dock: typeof Dock;
    DownloadItem: typeof DownloadItem;
    IncomingMessage: typeof IncomingMessage;
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
    WebRequest: typeof WebRequest;
    contextBridge: Electron.ContextBridge;
    inAppPurchase: Electron.InAppPurchase;
    nativeTheme: Electron.NativeTheme;
    net: Electron.Net;
    netLog: Electron.NetLog;
    powerMonitor: Electron.PowerMonitor;
    webContents: typeof WebContents;
    webviewTag: Electron.WebviewTag;
}
