import {initTrayListener} from './ngx-electron-tray';
import {initUpdateListener} from './ngx-electron-main-update';
import {initUtilListener} from './ngx-electron-main-util';
import {initWindowListener} from './ngx-electron-main-window';
import {initArgs} from './ngx-electron-main-args';
import {AllPublishOptions, PublishConfiguration} from 'builder-util-runtime';
import {autoUpdater} from 'electron-updater';
import {proxyIpcMainOn} from './ngx-electron-ipc-main-proxy';
import {ElectronProxy} from '@ngx-electron/core';
import * as electron from 'electron';
import {ipcMain} from 'electron';

let isInit = false;

function initElectronMainIpcListener(options?: PublishConfiguration | AllPublishOptions | string) {
    if (!isInit) {
        isInit = true;
        console.log(333);

        ElectronProxy.proxy(electron);
        // 代理ipcMain
        proxyIpcMainOn();
        // initArgs();
        // initTrayListener();
        initUtilListener();
        // initWindowListener();
        initUpdateListener(options);
    }
}

class NgxElectronMain {
    constructor(options?: PublishConfiguration | AllPublishOptions | string) {
        initElectronMainIpcListener(options);
    }
    setAutoUpdaterFeedURL(options) {
        autoUpdater.setFeedURL(options);
        return this;
    }
}


export {initElectronMainIpcListener, NgxElectronMain};

