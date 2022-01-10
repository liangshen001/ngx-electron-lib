import {NgxElectronBrowserWindowProxy} from '../browser-window/ngx-electron-browser-window-proxy';
import {NgxElectronWebContentsProxy} from '../web-contents/ngx-electron-web-contents-proxy';
import {NgxElectronCommonInterfaceProxy} from '../common-interface/ngx-electron-common-interface-proxy';
import {
    BrowserView,
    BrowserWindow,
    BrowserWindowProxy, CommandLine, Cookies, Dock, DownloadItem, Menu, MenuItem, NativeImage,
    Remote, Session, TouchBar, TouchBarButton,
    TouchBarColorPicker,
    TouchBarGroup,
    TouchBarLabel, TouchBarPopover, TouchBarScrubber, TouchBarSegmentedControl, TouchBarSlider,
    TouchBarSpacer, Tray, Notification,
    WebContents, WebRequest, ClientRequest, Debugger, IncomingMessage
} from 'electron';
import {NgxElectronAppProxy} from '../app/ngx-electron-app-proxy';

export abstract class NgxElectronRemoteProxy implements NgxElectronCommonInterfaceProxy, Remote {

    /**
     * The web contents of this web page.
     */
    abstract getCurrentWebContents(): NgxElectronWebContentsProxy;

    abstract getCurrentWindow(): NgxElectronBrowserWindowProxy;

    app: NgxElectronAppProxy;
    BrowserView: typeof BrowserView;
    BrowserWindow: typeof BrowserWindow;
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
    autoUpdater: Electron.AutoUpdater;
    clipboard: Electron.Clipboard;
    contentTracing: Electron.ContentTracing;
    contextBridge: Electron.ContextBridge;
    crashReporter: Electron.CrashReporter;
    desktopCapturer: Electron.DesktopCapturer;
    dialog: Electron.Dialog;
    globalShortcut: Electron.GlobalShortcut;
    inAppPurchase: Electron.InAppPurchase;
    ipcMain: Electron.IpcMain;
    ipcRenderer: Electron.IpcRenderer;
    nativeImage: typeof NativeImage;
    nativeTheme: Electron.NativeTheme;
    net: Electron.Net;
    netLog: Electron.NetLog;
    powerMonitor: Electron.PowerMonitor;
    powerSaveBlocker: Electron.PowerSaveBlocker;
    readonly process: NodeJS.Process;
    protocol: Electron.Protocol;
    remote: Electron.Remote;
    screen: Electron.Screen;
    session: typeof Session;
    shell: Electron.Shell;
    systemPreferences: Electron.SystemPreferences;
    webContents: typeof WebContents;
    webFrame: Electron.WebFrame;
    webviewTag: Electron.WebviewTag;

    abstract getGlobal(name: string): any;

    abstract require(module: string): any;
}
