import {initTrayListener} from './ngx-electron-tray';
import {initUpdateListener} from './ngx-electron-main-update';
import {initUtilListener} from './ngx-electron-main-util';
import {initWindowListener} from './ngx-electron-main-window';
import {initArgs} from './ngx-electron-main-args';
import {AllPublishOptions, PublishConfiguration} from 'builder-util-runtime';

let isInit = false;

function initElectronMainIpcListener(options?: PublishConfiguration | AllPublishOptions | string) {
    if (!isInit) {
        isInit = true;
        initArgs();
        initTrayListener();
        initUtilListener();
        initWindowListener();
        initUpdateListener(options);
    }
}


export {initElectronMainIpcListener};

