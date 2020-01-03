import {BrowserWindow, ipcMain, BrowserWindowConstructorOptions, app, Menu} from 'electron';
import * as path from 'path';
import * as url from 'url';
import {host, isServer, openDevTools, port} from './ngx-electron-main-args';
// winMap
const winIdMap = new Map<any, number>();

/**
 * 新开一个窗口
 * @param routerUrl 打开窗口加载的路由名字
 * @param options 创建窗口参数 有如下默认值
 * hasShadow: true
 * frame: false
 * transparent: true
 * show: false
 */
function createWindow(routerUrl: string, options: BrowserWindowConstructorOptions = {}, key = routerUrl): BrowserWindow {
    let win = new BrowserWindow({
        hasShadow: true,
        frame: false,
        transparent: true,
        show: false,
        webPreferences: {
          nodeIntegration: true
        },
        ...options
    });
    console.log(`创建窗口routerUrl：${routerUrl}`);
    if (isServer) {
        require('electron-reload')(app.getAppPath(), {
            electron: require(`${app.getAppPath()}/node_modules/electron`)
        });
        console.log(1111111111);
        const loadUrl = `http://${ host }:${ port }/#${ routerUrl }`;
        console.log(`创建窗口加载服务：${loadUrl}`);
        win.loadURL(loadUrl);
    } else {
        const pathname = path.join(app.getAppPath(), `/dist/${ app.getName() }/index.html`);
        console.log(`创建本地文件窗口 pathname:${pathname}#${routerUrl}`);
        win.loadURL(url.format({
            pathname,
            protocol: 'file:',
            slashes: true
        }) + `#${routerUrl}`);
    }
    winIdMap.set(key, win.id);
    if (isServer || openDevTools) {
        console.log(`isServer：${isServer} openDevTools：${openDevTools} 打开窗口调试工具`);
        win.webContents.openDevTools();
    }
    win.on('ready-to-show', () => {
        win.show();
        win.focus();
    });
    win.on('closed', () => {
        winIdMap.delete(key);
        win = null;
    });
    return win;
}


function getWinIdByKey(key: string) {
    return winIdMap.has(key) ? winIdMap.get(key) : null;
}

function initWindowListener() {
    // 用于在渲染进程中监测主进程是否加载此文件
    ipcMain.on('ngx-electron-load-electron-main', () => {});
    // 跟据key获得win对象 同步返回 winId
    ipcMain.on('ngx-electron-get-win-id-by-key', (event, key) =>
        event.returnValue = getWinIdByKey(key));
    // win被创建事件 保存到winMap
    ipcMain.on('ngx-electron-win-created', (event, key, winId) =>
        winIdMap.set(key, winId));
    // win被销毁
    ipcMain.on('ngx-electron-win-destroyed', (event, key) =>
        winIdMap.delete(key));
}

export {createWindow, initWindowListener};
