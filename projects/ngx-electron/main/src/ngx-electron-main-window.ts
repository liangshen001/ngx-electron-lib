import {BrowserWindow, ipcMain, BrowserWindowConstructorOptions, app, Menu} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as electronReload from 'electron-reload';
import {host, isServe, openDevTools, port} from './ngx-electron-main-args';

const s = path.join(app.getAppPath(), 'dist', app.getName());
console.log(s);
electronReload(s, {

});
// winMap
const winIdMap = new Map<any, number>();

export type BrowserWindowOptions = BrowserWindowConstructorOptions & {path: string, key?: string};

function createWindow(options: BrowserWindowOptions): BrowserWindow {
    let win = new BrowserWindow({
        ...options
    });
    console.log(`创建窗口routerUrl：${options.path}`);
    if (isServe) {
        const loadUrl = `http://${host}:${port}/#${options.path}`;
        console.log(`创建窗口加载服务：${loadUrl}`);
        win.loadURL(loadUrl);
    } else {
        const pathname = path.join(app.getAppPath(), `/dist/${app.getName()}/index.html`);
        console.log(`创建本地文件窗口 pathname:${pathname}#${options.path}`);
        win.loadURL(url.format({
            pathname,
            protocol: 'file:',
            slashes: true
        }) + `#${options.path}`);
        win.webContents.reloadIgnoringCache();
    }
    if (options.key) {
        winIdMap.set(options.key, win.id);
    }
    if (isServe || openDevTools) {
        console.log(`isServe：${isServe} openDevTools：${openDevTools} 打开窗口调试工具`);
        win.webContents.openDevTools();
    }
    win.on('ready-to-show', () => {
        win.show();
        win.focus();
    });
    win.on('closed', () => {
        if (options.key) {
            winIdMap.delete(options.key);
        }
        win = null;
    });
    return win;
}


function getWinIdByKey(key: string) {
    return winIdMap.has(key) ? winIdMap.get(key) : null;
}

function initWindowListener() {
    // 用于在渲染进程中监测主进程是否加载此文件
    ipcMain.on('ngx-electron-load-electron-main', () => {
    });
    // 跟据key获得win对象 同步返回 winId
    ipcMain.on('ngx-electron-renderer-get-win-id-by-key', (event, key) => event.returnValue = getWinIdByKey(key));
    // win被创建事件 保存到winMap
    ipcMain.on('ngx-electron-renderer-win-created', (event, key, winId) => winIdMap.set(key, winId));
    // win被销毁
    ipcMain.on('ngx-electron-renderer-win-destroyed', (event, key) => winIdMap.delete(key));
}

export {createWindow, initWindowListener};
