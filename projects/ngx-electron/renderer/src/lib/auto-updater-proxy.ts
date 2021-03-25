import {IpcRenderer, Remote} from 'electron';
import {Observable} from 'rxjs';
import {UpdateInfo} from 'electron-updater';

export interface ProgressInfo {
    total: number;
    delta: number;
    transferred: number;
    percent: number;
    bytesPerSecond: number;
}

export class AutoUpdaterProxy {
    error = new Observable<[{
        code?: 'ERR_UPDATER_ZIP_FILE_NOT_FOUND' | string
    }, string]>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-updater-error', (event, error, message) => subscriber.next([error, message]));
    });
    // void
    checkingForUpdate = new Observable<void>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-checking-for-update', (event) => subscriber.next());
    });
    updateAvailable = new Observable<UpdateInfo>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-update-available', (event, info) => subscriber.next(info));
    });
    updateNotAvailable = new Observable<UpdateInfo>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-update-not-available', (event, info) => subscriber.next(info));
    });
    downloadProgress = new Observable<ProgressInfo>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-download-progress', (event, info) => subscriber.next(info));
    });
    // updateDownloateDownloaded = new Observable<any>(subscriber => {
    //     this.ipcRenderer.on('ngx-electron-main-update-downloate-downloaded',
    //         (e, event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) => subscriber.next({
    //             event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate
    //         }));
    updateDownloaded = new Observable<UpdateInfo>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-update-downloaded',
            (e, info) => subscriber.next(info));
    });
    constructor(private ipcRenderer: IpcRenderer, private remote: Remote) {}

    checkForUpdates() {
        this.ipcRenderer.send('ngx-electron-renderer-check-for-updates');
    }
    downloadUpdate() {
        this.ipcRenderer.send('ngx-electron-renderer-download-update');
    }
    quitAndInstall(isSilent?: boolean, isForceRunAfter?: boolean) {
        this.ipcRenderer.send('ngx-electron-renderer-quit-and-install', isSilent, isForceRunAfter);
    }
}
