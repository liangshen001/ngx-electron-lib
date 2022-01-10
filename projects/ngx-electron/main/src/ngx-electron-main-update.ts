
import { autoUpdater } from 'electron-updater';
import { ipcMain, BrowserWindow } from 'electron';
import {AllPublishOptions, PublishConfiguration} from 'builder-util-runtime';

function initUpdateListener(options: PublishConfiguration | AllPublishOptions | string) {
    /**
     * 检测是否有新版
     */
    ipcMain.on('ngx-electron-renderer-check-for-updates', () => {
        autoUpdater.checkForUpdates();
    });
    // 执行自动更新检查
    if (options) {
        autoUpdater.setFeedURL(options);
    }
    autoUpdater.autoDownload = false;
    // autoUpdater.on('error', (...args) => {
    //     console.log('error: {}', args);
    //     BrowserWindow.getAllWindows().forEach(
    //         win => win.webContents.send('ngx-electron-main-updater-error', ...args))
    // });
    // autoUpdater.on('checking-for-update', (...args) => {
    //     console.log('checking-for-update: {}', args);
    //     BrowserWindow.getAllWindows().forEach(
    //         win => win.webContents.send('ngx-electron-main-checking-for-update', ...args));
    // });

    autoUpdater.checkForUpdates().then(data => {
        console.log('checking-for-update: {}', data);
        BrowserWindow.getAllWindows().forEach(
            win => win.webContents.send('ngx-electron-main-checking-for-update'));
    });
    // autoUpdater.on('update-available', (...args) => {
    //     console.log('update-available: {}', args);
    //     BrowserWindow.getAllWindows().forEach(
    //         win => win.webContents.send('ngx-electron-main-update-available', ...args))
    // });
    // autoUpdater.on('update-not-available', (...args) => {
    //     console.log('update-not-available: {}', args);
    //     BrowserWindow.getAllWindows().forEach(
    //         win => win.webContents.send('ngx-electron-main-update-not-available', ...args))
    // });

    autoUpdater.downloadUpdate().then(data => {
        console.log('download-progress: {}', data);
        BrowserWindow.getAllWindows().forEach(
            win => win.webContents.send('ngx-electron-main-download-progress', data))
    })
    // 更新下载进度事件
    // autoUpdater.on('download-progress', (...args) => {
    //     console.log('download-progress: {}', args);
    //     BrowserWindow.getAllWindows().forEach(
    //         win => win.webContents.send('ngx-electron-main-download-progress', ...args))
    // });
    // 下载完成
    // autoUpdater.on('update-downloaded',
    //     (...args) =>  BrowserWindow.getAllWindows().forEach(
    //         win => win.webContents.send('ngx-electron-main-update-downloaded', ...args)));
    // autoUpdater.on('update-downloate-downloaded',
    //     (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) =>  BrowserWindow.getAllWindows().forEach(
    //         win => win.webContents.send('ngx-electron-main-update-downloate-downloaded',
    //             event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate)));
    /**
     * 下载新版
     */
    ipcMain.on('ngx-electron-renderer-download-update', () => {
        autoUpdater.downloadUpdate();
    });
    /**
     * 退出当前版本安装新版
     */
    ipcMain.on('ngx-electron-renderer-quit-and-install',
        (event, isSilent, isForceRunAfter) => autoUpdater.quitAndInstall(isSilent, isForceRunAfter));
}


export {initUpdateListener};
