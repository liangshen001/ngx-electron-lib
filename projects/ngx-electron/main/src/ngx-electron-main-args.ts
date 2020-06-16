import {ipcMain} from 'electron';

let isServe = false;
let host;
let port;
let openDevTools;

function getArgValue(args: string[], name: string): string | boolean {
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

function initArgs() {
    const args = process.argv.splice(2);
    console.log(`初始化ngx-electron-main, 启动参数：${JSON.stringify(args)}`);
    isServe = args.includes('--serve');
    if (isServe) {
        console.log('加载服务的方式运行');
        port = getArgValue(args, '--port') || 8080;
        host = getArgValue(args, '--host') || 'localhost';
        console.log(`host:${host}`);
        console.log(`port:${port}`);
    }
    openDevTools = args.includes('--open-dev-tools');

    // 判断是否以服务的形式加载页面
    ipcMain.on('ngx-electron-is-serve', event => event.returnValue = isServe);
    // 如果当前以服务的形式加载页面，得到当前服务的port
    ipcMain.on('ngx-electron-get-port', event => event.returnValue = port);
    // 如果当前以服务的形式加载页面，得到当前服务的host
    ipcMain.on('ngx-electron-get-host', event => event.returnValue = host);
    // 是否打开应用调试器
    ipcMain.on('ngx-electron-is-open-dev-tools', event => event.returnValue = openDevTools || isServe);
}

export {isServe, host, port, openDevTools, initArgs};
