import {Injectable, NgZone} from '@angular/core';
import {Action, Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {concat, Observable} from 'rxjs';
import {BrowserWindow, BrowserWindowConstructorOptions} from 'electron';
import {NgxElectronService, ParentParams} from '@ngx-electron/core';

@Injectable()
export class StoreService {
  constructor(private store$: Store<any>,
              private ngZone: NgZone,
              private router: Router,
              private electronService: NgxElectronService) {
    if (this.electronService.isElectron()) {
      const winId = this.electronService.remote.getCurrentWindow().id;
      this.electronService.ipcRenderer.on(`ngx-electron-action-shared-${winId}`,
        (event, action) => this.ngZone.run(() => this.store$.dispatch(action)));
      this.electronService.ipcRenderer.send(`ngx-electron-win-init-${winId}`);
    }
  }

  /**
   * 发送action id用来指定要发送的win对象 需要指定
   */
  dispatch(action: Action, ...ids: number[]);
  /**
   * 发送action key用来指定要发送的win对象 调用此方法需要主进程初始化@ngx-electron/electron-main模块
   */
  dispatch(action: Action, ...keys: string[]);

  dispatch(action: Action, ...idKeys: any[]) {
    if (this.electronService.isElectron()) {
      if (idKeys && idKeys.length) {
        idKeys.filter(idKey => idKey)
          .map(idKey => {
            switch (typeof idKey) {
              case 'number': {
                return idKey;
              }
              case 'string': {
                return this.electronService.isLoadElectronMain && this.electronService.getWinIdByKey(idKey);
              }
              default: return null;
            }
          })
          .filter(id => id)
          .map(id => this.electronService.remote.BrowserWindow.fromId(id))
          .filter(win => win)
          .forEach(win => win.webContents.send(`ngx-electron-action-shared-${win.id}`, action));
      } else {
        this.electronService.remote.BrowserWindow.getAllWindows()
          .forEach(win => win.webContents.send(`ngx-electron-action-shared-${win.id}`, action));
      }
    } else {
      this.store$.dispatch(action);
    }
  }

  openPage(routerUrl: string, options: BrowserWindowConstructorOptions = {}, {
    key = routerUrl,
    actions,
    webHandler = () => this.router.navigateByUrl(routerUrl),
    complete,
    created,
    parent
  }: {
    key?: string,
    actions?: Observable<Action>[],
    webHandler?: () => void,
    complete?: () => void,
    created?: (win: BrowserWindow) => void,
    parent?: ParentParams
  } = {
    key: routerUrl,
    webHandler: () => this.router.navigateByUrl(routerUrl)
  }): BrowserWindow {
    if (this.electronService.isElectron()) {
      if (this.electronService.isLoadElectronMain) {
        const winId = this.electronService.getWinIdByKey(key);
        console.log(`获得窗口${key}的窗口ID:${winId}`);
        if (winId) {
          const win = this.electronService.remote.BrowserWindow.fromId(winId);
          win.focus();
          return win;
        }
      }
      if (parent) {
        let parentWinId;
        if (!parent.winId) {
          parentWinId = this.electronService.getWinIdByKey(parent.winKey);
        }
        if (parentWinId) {
          options.parent = this.electronService.remote.BrowserWindow.fromId(parentWinId);
        }
      }
      const win2 = this.electronService.createWindow(routerUrl, key, options);
      if (created) {
        created(win2);
      }
      console.log(`创建窗口成功`);
      this.electronService.remote.ipcMain.on(`ngx-electron-win-init-${win2.id}`, event =>
        actions && concat(...actions).subscribe(action =>
          win2.webContents.send(`ngx-electron-action-shared-${win2.id}`, action),
        () => {},
        () => complete && complete()));
      return win2;
    } else {
      webHandler();
    }
  }
}
