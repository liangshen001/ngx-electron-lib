
import { autoUpdater } from 'electron-updater';
import { ipcMain, BrowserWindow } from 'electron';
import {AllPublishOptions, PublishConfiguration} from 'builder-util-runtime';

function initUpdateListener(options: PublishConfiguration | AllPublishOptions | string) {
    /**
     * 检测是否有新版
     */
    ipcMain.on('ngx-electron-renderer-check-for-updates', e => {
        autoUpdater.checkForUpdates();
    });
    // 执行自动更新检查
    if (options) {
        autoUpdater.setFeedURL(options);
    }
    autoUpdater.autoDownload = false;
    autoUpdater.on('error', error => BrowserWindow.getAllWindows().forEach(
        win => win.webContents.send('ngx-electron-main-updator-error', error)));
    autoUpdater.on('checking-for-update', () => BrowserWindow.getAllWindows().forEach(
        win => win.webContents.send('ngx-electron-main-checking-for-update')));
    autoUpdater.on('update-available', info => BrowserWindow.getAllWindows().forEach(
        win => win.webContents.send('ngx-electron-main-update-available', info)));
    autoUpdater.on('update-not-available', info => BrowserWindow.getAllWindows().forEach(
        win => win.webContents.send('ngx-electron-main-update-not-available', info)));

    // 更新下载进度事件
    autoUpdater.on('download-progress', progressObj => BrowserWindow.getAllWindows().forEach(
        win => win.webContents.send('ngx-electron-main-download-progress')));
    // 下载完成
    autoUpdater.on('update-downloate-downloaded',
        (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) =>  BrowserWindow.getAllWindows().forEach(
            win => win.webContents.send('ngx-electron-main-update-downloate-downloaded',
                event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate)));
    /**
     * 下载新版
     */
    ipcMain.on('ngx-electron-renderer-download-update', e => {
        autoUpdater.downloadUpdate();
    });
    /**
     * 退出当前版本安装新版
     */
    ipcMain.on('ngx-electron-renderer-quit-and-install',
        (event, isSilent, isForceRunAfter) => autoUpdater.quitAndInstall(isSilent, isForceRunAfter));
}


export {initUpdateListener};
