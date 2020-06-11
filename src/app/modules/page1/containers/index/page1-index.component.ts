import {Component, OnInit} from '@angular/core';
import {ActionsSubject, ReducerManager, StateObservable, Store} from '@ngrx/store';
import {UserReducerState} from '../../../../reducers/user.reducer';
import {ElectronService} from '@ngx-electron/core';
import {Router} from '@angular/router';
import {loadUserList} from '../../../../actions/user.action';
import {ElectronStore} from '@ngx-electron/redux';
import {AppState} from '../../../../reducers';
import {BrowserWindow} from 'electron';
import {take} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-page1',
    templateUrl: './page1-index.component.html'
})
export class Page1IndexComponent implements OnInit {
    title = 'page1';

    page2Win: BrowserWindow;
    page3Win: BrowserWindow;


    ngOnInit(): void {
        this.store$.dispatch(loadUserList());
    }

    constructor(private electronService: ElectronService,
                private state$: StateObservable,
                private actionsObserver: ActionsSubject,
                private reducerManager: ReducerManager,
                private router: Router,
                private store$: ElectronStore<AppState>) {
        // this.heroService.getAll({
        //     isOptimistic: true,
        //     mergeStrategy: MergeStrategy.PreserveChanges
        // });

        this.state$.pipe(
            take(1)
        ).subscribe(state => {
        debugger;
        });
        // const tray = new this.electronService.electron.remote.Tray('');
    }

    openPage2() {
        // const win = new this.electronService.remote.BrowserWindow({
        //     width: 1024,
        //     height: 768,
        //     title: 'ngx-electron-lib2'
        // });
        // const httpurl = `${url.format({
        //     pathname: path.join(this.electronService.remote.app.getAppPath(),
        //         'dist', this.electronService.remote.app.getName(), 'index.html'),
        //     protocol: 'file:',
        //     slashes: true
        // })}#page2`;
        // console.log(`加载url:${url}`);
        // win.loadURL(httpurl);
        // win.webContents.openDevTools();
        if (this.electronService.isElectron) {
            this.page2Win = this.electronService.createWindow({
                path: 'page2',
                key: 'page2',
                width: 1024,
                height: 768,
                title: 'ngx-electron-lib2',
                webPreferences: {
                    nodeIntegration: true
                },
                callback: event => this.store$.synchronized(event)
            });
        } else {
            this.router.navigateByUrl('page2');
        }
        // this.electronService.openPage('page2', {
        //     width: 1024,
        //     height: 768,
        //     title: 'ngx-electron-lib2',
        //     webPreferences: {
        //         nodeIntegration: true
        //     }
        // }, {
        //     initData: this.title
        // });
    }

    sendData() {
        this.electronService.sendDataToWindows('page1 data', this.page2Win);
        this.electronService.sendDataToWindows('page2 data', this.page3Win);
    }

    openPage3() {
        if (this.electronService.isElectron) {
            this.page3Win = this.electronService.createWindow({
                path: 'page3',
                key: 'page3',
                width: 1024,
                height: 768,
                title: 'ngx-electron-lib2',
                webPreferences: {
                    nodeIntegration: true
                },
                callback: event => this.store$.synchronized(event)
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
}
