# @ngx-electron/renderer

angular 8.x
electron 7.x


main.ts
```
import {ipcMainProxy} from '@ngx-electron/main';

ipcMainProxy.on('test', (event, a) => {
    a((args) => {
        console.log(args);
    });
});
```


angular
```

constructor(private electronService: ElectronService) {}

test() {
    this.electronService.ipcRenderer.send('test', (callback: (args) => void) => {
        // ...
        callback('俩层回调函数');
        // ...
    });
}
```




