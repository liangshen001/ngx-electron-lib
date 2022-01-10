import {initTrayListener} from './ngx-electron-tray';
import {initUpdateListener} from './ngx-electron-main-update';
import {initUtilListener} from './ngx-electron-main-util';
import {AllPublishOptions, PublishConfiguration} from 'builder-util-runtime';
import {autoUpdater} from 'electron-updater';
import {NgxElectronProxy, ChannelsMap, NgxElectronBrowserWindowProxy, NgxElectronIpcMainProxy} from '@ngx-electron/core';
import * as electron from 'electron';


export class NgxElectronMain {
    static isInit = false;
    static init<T extends ChannelsMap>(options?: PublishConfiguration | AllPublishOptions | string): {
        ipc: NgxElectronIpcMainProxy<T>,
        ElectronBrowserWindow: NgxElectronBrowserWindowProxy
    } {
        // const proxy = NgxElectronProxy.proxy<T>(electron);
        if (!this.isInit) {
            this.isInit = true;
            // 代理ipcMain
            // proxyIpcMainOn();
            // initArgs();
            // initTrayListener();
            initUtilListener();
            // initWindowListener();
            initUpdateListener(options);
        }
        return null;
    }
}

