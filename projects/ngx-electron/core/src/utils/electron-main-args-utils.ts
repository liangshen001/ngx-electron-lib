import {ipcMain, ipcRenderer, remote} from 'electron';
import {isRenderer} from './utils';

let host;
let port;
let openDevTools = false;
let isServe = false;

if (isRenderer) {
    const initData = ipcRenderer.sendSync('ngx-electron-init');
    host = initData.host;
    port = initData.port;
    openDevTools = initData.openDevTools;
    isServe = initData.isServe;
    console.log(initData);
    if (!remote.ipcMain.listenerCount('ngx-electron-load-electron-main')) {
        throw new Error('@ngx-electron/main is not imported in electron main');
    }
} else {
    // 用于在渲染进程中监测主进程是否加载此文件
    ipcMain.on('ngx-electron-load-electron-main', () => {});
    const args = process.argv.splice(2);
    console.log(`初始化ngx-electron-main, 启动参数：${JSON.stringify(args)}`);
    isServe = args.includes('--serve');
    if (isServe) {
        const getArgValue = (name: string) => {
            const argNameIndex = args.indexOf(name);
            if (argNameIndex) {
                const argValueIndex = argNameIndex + 1;
                if (args.length > argValueIndex) {
                    return args[argValueIndex];
                } else {
                    throw new Error(`请在${name}后输入值`);
                }
            }
            return false;
        }
        console.log('加载服务的方式运行');
        port = getArgValue('--port') || 8080;
        host = getArgValue('--host') || 'localhost';
        console.log(`host:${host}`);
        console.log(`port:${port}`);
    }
    openDevTools = args.includes('--open-dev-tools');

    ipcMain.on('ngx-electron-init', event => event.returnValue = {isServe, port, host, openDevTools});
}

export {isServe, host, port, openDevTools};
