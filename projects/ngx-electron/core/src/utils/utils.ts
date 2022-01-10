
// 被代理的对象 用于判断一个对象是否为被代理的对象
import {CommonInterface, ipcMain, ipcRenderer, remote} from 'electron';

export const proxySet = new WeakSet();
Proxy = new Proxy(Proxy, {
    construct(target, args: any, newTarget) {
        const proxy = Reflect.construct(target, args, newTarget);
        proxySet.add(proxy);
        return proxy;
    }
});

const isRenderer = (!process || process.type === 'renderer') && ipcRenderer

let host;
let port;
let openDevTools = false;
let isServe = false;
let isMac;
let isWindows;
let isLinux;

if (isRenderer) {
    const initData = ipcRenderer.sendSync('ngx-electron-init');
    host = initData.host;
    port = initData.port;
    openDevTools = initData.openDevTools;
    isServe = initData.isServe;
    isLinux = initData.isLinux;
    isMac = initData.isMac;
    isWindows = initData.isWindows;
    console.log(initData);
    if (!remote.ipcMain.listenerCount('ngx-electron-load-electron-main')) {
        throw new Error('@ngx-electron/main is not imported in electron main');
    }
} else {
    isMac = process.platform === 'darwin';
    isWindows = process.platform === 'win32'
    isLinux = process.platform === 'linux'
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
    }
    openDevTools = args.includes('--open-dev-tools');

    ipcMain.on('ngx-electron-init', event =>
        event.returnValue = {isServe, port, host, openDevTools, isMac, isWindows, isLinux});
}

export {isServe, host, port, openDevTools, isMac, isWindows, isLinux, isRenderer};
