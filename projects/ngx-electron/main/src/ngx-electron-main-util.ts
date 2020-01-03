import {ipcMain} from 'electron';

function isMac() {
    return process.platform === 'darwin';
}

function isWindows() {
    return process.platform === 'win32';
}

function isLinux() {
    return process.platform === 'linux';
}

function initUtilListener() {
    // 是否为mac
    ipcMain.on('ngx-electron-is-mac', event => event.returnValue = isMac());
    // 是否为windows
    ipcMain.on('ngx-electron-is-windows', event => event.returnValue = isWindows());
    // 是否为linux
    ipcMain.on('ngx-electron-is-linux', event => event.returnValue = isLinux());
}

export {isMac, isWindows, isLinux, initUtilListener};
