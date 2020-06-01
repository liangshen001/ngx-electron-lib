import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {map, take} from 'rxjs/operators';
import {UserReducerState, getAllUsers} from '../../../../reducers/user.reducer';
import {LoadUserList, LoadUserListSuccess} from '../../../../actions/user.action';
import {NgxElectronService} from '../../../../../../projects/ngx-electron/core/src/lib/services/ngx-electron.service';
import {NgxElectronStoreService} from '../../../../../../projects/ngx-electron/store/src/public-api';

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
    this.electronService.openPage('page2', {
      width: 1024,
      height: 768
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
