# @ngx-electron/core

适用版本

angular 8.x
electron 7.x



用于解决angular与electron应用数据传递问题，减少与主进程的交互，可以用angular的方式去操作electron的部分api，包括创建窗口，创建Tray，窗口间数据的传递


相关项目
* @ngx-electron/main
* @ngx-electron/store
* @ngx-electron/cli

完整例子请看 @ngx-electron/cli 并使用ngx-electron来创建 并代替electron来启动应用

## 使用

main.ts

```typescript

import {createTray, createWindow, initElectronMainIpcListener, isMac} from '@ngx-electron/main';

initElectronMainIpcListener();

```


