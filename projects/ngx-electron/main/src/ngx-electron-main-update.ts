
import { autoUpdater } from 'electron-updater';
import { ipcMain } from 'electron';

function initUpdateListener() {
    /**
     * 检测是否有新版
     */
    ipcMain.on('ngx-electron-check-for-updates', e => {
        // 执行自动更新检查
        autoUpdater.setFeedURL('http://www.liangshen.sit/chat/latest/win');
        autoUpdater.autoDownload = false;
        autoUpdater.on('error', error => e.sender.send('error', error));
        autoUpdater.on('checking-for-update', () => e.sender.send('checking-for-update'));
        autoUpdater.on('update-available', info => e.sender.send('update-available', info));
        autoUpdater.on('update-not-available', info => e.sender.send('update-not-available', info));
        autoUpdater.checkForUpdates();
    });
    /**
     * 下载新版
     */
    ipcMain.on('ngx-electron-download-update', e => {
        autoUpdater.downloadUpdate();

        // 更新下载进度事件
        autoUpdater.on('download-progress', progressObj =>
            e.sender.send('ngx-electron-download-progress', progressObj));
        // 下载完成
        autoUpdater.on('update-downloate-downloaded',
            (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) => e.sender.send(
                'ngx-electron-update-downloate-downloaded', event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate));
    });
    /**
     * 退出当前版本安装新版
     */
    ipcMain.on('ngx-electron-quit-and-install', () => autoUpdater.quitAndInstall());
}


export {initUpdateListener};
