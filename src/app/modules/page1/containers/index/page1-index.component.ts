import {Component, OnInit} from '@angular/core';
import {ActionsSubject, ReducerManager, StateObservable} from '@ngrx/store';
import {NgxElectronService} from '@ngx-electron/renderer';
import {Router} from '@angular/router';
import {loadUserList} from '../../../../actions/user.action';
import {NgxElectronStore} from '@ngx-electron/redux';
import {AppState} from '../../../../reducers';
import {BrowserWindow} from 'electron';
import {take} from 'rxjs/operators';
import {NgxElectronBrowserWindowProxy, NgxElectronProxy} from '@ngx-electron/core';

@Component({
    selector: 'app-page1',
    templateUrl: './page1-index.component.html'
})
export class Page1IndexComponent implements OnInit {
    title = 'page1';

    page2Win: BrowserWindow;
    page3Win: BrowserWindow;

    message: string;


    ngOnInit(): void {
        this.store$.dispatch(loadUserList());
    }

    constructor(private electronService: NgxElectronService,
                private ngxElectronProxy: NgxElectronProxy<any>,
                private state$: StateObservable,
                private actionsObserver: ActionsSubject,
                private reducerManager: ReducerManager,
                private router: Router,
                private store$: NgxElectronStore<AppState>) {
        // const a = new this.electronService.electron.remote.Tray('');
        // console.log(a);
        // this.state$.pipe(
        //     take(1)
        // ).subscribe(state => {
        // });
        //
        // // this.electronService.remote.getCurrentWindow().webContents.openDevTools();
        // this.electronService.autoUpdater.checkingForUpdate.subscribe((a) => {
        //     console.log('checkingForUpdate' + JSON.stringify(a));
        // });
        // this.electronService.autoUpdater.updateAvailable.subscribe((a) => {
        //     console.log('updateAvailable' + JSON.stringify(a));
        // });
        // this.electronService.autoUpdater.updateNotAvailable.subscribe((a) => {
        //     console.log('updateNotAvailable' + JSON.stringify(a));
        // });
        // this.electronService.autoUpdater.error.subscribe((e) => {
        //     console.log('error' + JSON.stringify(e));
        // });
        // this.electronService.autoUpdater.downloadProgress.subscribe((e) => {
        //     console.log('downloadProgress' + JSON.stringify(e));
        // });
        // this.electronService.autoUpdater.updateDownloaded.subscribe((e) => {
        //     console.log('updateDownloateDownloaded' + JSON.stringify(e));
        // });
        // this.electronService.ipcRenderer.on('isUpdateNow', () => {
        //     this.electronService.ipcRenderer.send('isUpdateNow');
        // });

        // this.electronService.tray.on('double-click', () => this.electronService.remote.getCurrentWindow().focus());
        // const tray = new this.electronService.electron.remote.Tray('');
    }

    test() {
        // const win = new this.ngxElectronProxy.BrowserWindow({
        //     ngxPath: 'page3',
        //     width: 1024,
        //     height: 768,
        //     title: 'ngx-electron-lib2',
        //     webPreferences: {
        //         nodeIntegration: true
        //     },
        // });
        // win.webContents.openDevTools();
        // win.onBlur.subscribe(data => {
        //     console.log(11111111111);
        // })
        //
        //
        this.ngxElectronProxy.ipcRenderer.send('sendFunctionToMain', 123);
        // this.ngxElectronProxy.remote.Menu.setApplicationMenu(this.ngxElectronProxy.remote.Menu.buildFromTemplate([{
        //     label: 'test',
        //     role: 'about',
        //     type: 'radio'
        // }]))
    }

    createTray() {
        // this.electronService.tray.create('assets/favicon.ico');
        this.electronService.tray.create('assets/favicon.ico');
        // const a = [{
        //     label: 'test',
        //     click: () => {
        //         alert(1111);
        //     }
        // }];
        // this.electronService.tray.setContextMenu(this.electronService.remote.Menu.buildFromTemplate([{
        //     label: 'test',
        //     click: () => {
        //         alert(1111);
        //     }
        // }]));

        // this.electronService.ipcRenderer.sendSync('ngx-electron-renderer-set-tray-menu-items', [{
        //     label: 'test',
        //     click: () => {
        //         alert(1111);
        //     }
        // }]);
        const a = this.electronService.remote.Menu.buildFromTemplate([{
            label: 'test',
            click: () => {
                alert(1111);
            }
        }]);

        this.electronService.ipcRenderer.sendSync('ngx-electron-renderer-set-tray-menu2', a);
    }


    destroyTray() {
        this.electronService.tray.destroy();
    }

    openPage2() {
        this.electronService.tray.destroy();
        // this.electronService.autoUpdater.checkForUpdates();
    }

    sendData() {
        this.electronService.sendDataToWindows('page1 data', this.page2Win);
        this.electronService.sendDataToWindows('page2 data', this.page3Win);
    }

    downloadUpdate(): void {
        this.electronService.autoUpdater.downloadUpdate();
    }

    checkForUpdates(): void {
        this.electronService.autoUpdater.checkForUpdates();
    }

    openPage3() {
        if (this.electronService.isElectron) {
            this.page3Win = this.electronService.createWindow({
                ngxPath: 'page3',
                // key: 'page3',
                width: 1024,
                height: 768,
                title: 'ngx-electron-lib2',
                webPreferences: {
                    nodeIntegration: true
                },
                // callback: event => this.store$.synchronized(event.sender)
            });
        } else {
            this.router.navigateByUrl('page3');
        }
        // 打开页面并把所有的user数据传输过去
        // this.electronDataService.openPage('page3', {
        //     width: 1024,
        //     height: 768,
        //     webPreferences: {
        //         nodeIntegration: true
        //     }
        // }, {
        //     actions: [
        //         this.store$.pipe(
        //             select(getAllUsers),
        //             map(users => new LoadUserListSuccess(users)),
        //             take(1)
        //         )
        //     ]
        // });
    }

    sendFunctionToMain() {
        // this.electronService.electron.ipcRenderer.send('sendFunctionToMain', (a) => {a((b) => {console.log(b)}, (c) => {console.log(c)})})
        // this.electronService.electron.ipcRenderer.send('sendFunctionToMain', (a) => {a()})
        // const win = new NgxElectronBrowserWindowProxy({
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
        // win.onceClose.subscribe(a => {
        //     alert(1);
        // })
    }
}
