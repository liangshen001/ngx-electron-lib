import {IpcRenderer, Remote} from 'electron';
import {AppUpdater} from 'electron-updater';
import {Observable} from 'rxjs';

export class AutoUpdaterProxy {
    error = new Observable<{
        code: 'ERR_UPDATER_ZIP_FILE_NOT_FOUND' | string
    }>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-updator-error', (event, error) => subscriber.next(error));
    });
    checkingForUpdate = new Observable<void>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-checking-for-update', () => subscriber.next());
    });
    updateAvailable = new Observable<{
        files: {sha512: string; size: number; url: string}[];
        path: string;
        releaseDate: string;
        sha512: string;
        version: string;
    }>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-update-available', (e, info) => subscriber.next(info));
    });
    updateNotAvailable = new Observable<{
        files: {sha512: string; size: number; url: string}[];
        path: string;
        releaseDate: string;
        sha512: string;
        version: string;
    }>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-update-not-available', (e, info) => subscriber.next(info));
    });
    downloadProgress = new Observable<any>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-download-progress', () => subscriber.next());
    });
    updateDownloateDownloaded = new Observable<any>(subscriber => {
        this.ipcRenderer.on('ngx-electron-main-update-downloate-downloaded',
            (e, event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) => subscriber.next({
                event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate
            }));
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
