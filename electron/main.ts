import * as electron from 'electron';
import { autoUpdater } from 'electron-updater';
// import {isMac, NgxElectronMain} from '@ngx-electron/main';
import * as core from '@ngx-electron/core';
import {NgxElectronBrowserWindowProxy, NgxElectronProxy, isMac} from '@ngx-electron/core';
import {ChannelsMap} from "./channels-map";
// export class BrowserWindowProxy extends BrowserWindow {
// }

let win: NgxElectronBrowserWindowProxy;


const {BrowserWindow, ipcMain} = NgxElectronProxy.instanceOf<ChannelsMap>(electron);

ipcMain.onChannel('sendFunctionToMain').subscribe(data => {
    console.log(data.data);
});

// ipc.on('sendFunctionToMain').subscribe(a => {
//     a.args[0](() => {
//         console.log(1111111);
//     });
// });

// ipcMain.on('sendFunctionToMain', (event, callback) => {
//     callback(() => {
//         console.log(1111111);
//     });
// })


function init() {
    win = new BrowserWindow({
        width: 1024,
        height: 768,
        show: true,
        autoHideMenuBar: true,
        title: 'ngx-electron-lib',
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });
    win.webContents.openDevTools();
    // win.onClose.subscribe(() => app.quit());
    // createTray('assets/favicon.ico');
    // win = createWindow({
    //     path: '',
    //     width: 1024,
    //     height: 768,
    //     show: true,
    //     autoHideMenuBar: true,
    //     title: 'ngx-electron-lib',
    //     webPreferences: {
    //         nodeIntegration: true,
    //         webSecurity: false
    //     }
    // });
    // win.webContents.openDevTools();
    // win.on('close', () => app.quit());
}

// ipcMain.on('ngx-electron-renderer-set-tray-menu2', (e, a) => {
//     const tray = new Tray('F:/WebStorm/workspace/ngx-electron-lib/src/assets/favicon.ico');
//     tray.setContextMenu(a);
//     // tray.setContextMenu(a);
// });


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron.app.on('ready', init);

// Quit when all windows are closed.
electron.app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (!isMac) {
        electron.app.quit();
    }
});

electron.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        // loginWin = createLoginWindow(appTray);
    }
});
