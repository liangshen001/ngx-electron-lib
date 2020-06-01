import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {map, take} from 'rxjs/operators';
import {UserReducerState, getAllUsers} from '../../../../reducers/user.reducer';
import {LoadUserList, LoadUserListSuccess} from '../../../../actions/user.action';
import {NgxElectronService} from '@ngx-electron/core';
import {NgxElectronStoreService} from '@ngx-electron/store';

@Component({
    selector: 'app-page1',
    templateUrl: './page1-index.component.html'
})
export class Page1IndexComponent implements OnInit {
    title = 'page1';

    ngOnInit(): void {
        this.store$.dispatch(new LoadUserList());
    }

    constructor(private electronService: NgxElectronService,
                private store$: Store<UserReducerState>,
                private electronDataService: NgxElectronStoreService) {
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
        this.electronService.openPage('page2', {
            width: 1024,
            height: 768,
            title: 'ngx-electron-lib2'
        }, {
            initData: this.title
        });
    }

    sendData() {
        this.electronService.send('page1 data', 'page2');
    }

    openPage3() {
        // 打开页面并把所有的user数据传输过去
        this.electronDataService.openPage('page3', {
            width: 1024,
            height: 768
        }, {
            actions: [
                this.store$.pipe(
                    select(getAllUsers),
                    map(users => new LoadUserListSuccess(users)),
                    take(1)
                )
            ]
        });
    }
}
