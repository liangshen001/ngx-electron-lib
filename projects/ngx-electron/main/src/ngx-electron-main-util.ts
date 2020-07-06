import {ipcMain, IpcMain, WebContents, MenuItem} from 'electron';
import { v4 as uuidv4 } from 'uuid';
import {global} from '@angular/compiler/src/util';

const proxy_set = new WeakSet();
global.Proxy = new Proxy(Proxy, {
    construct(target, args: any) {
        // @ts-ignore
        const proxy = new target(...args);
        proxy_set.add(proxy);
        return proxy;
    }
});

function isMac() {
    return process.platform === 'darwin';
}

function isWindows() {
    return process.platform === 'win32';
}

function isLinux() {
    return process.platform === 'linux';
}

const rendererCallbackMap = new Map<string, Function>();
const mainCallbackMap = new Map<string, Function>();


const ipcMainProxy: IpcMain = {
    addListener(event: string | symbol, listener: (...args: any[]) => void): IpcMain {
        return ipcMain.addListener(event, listener);
    }, emit(event: string | symbol, ...args: any[]): boolean {
        return ipcMain.emit(event, ...args);
    }, eventNames(): Array<string | symbol> {
        return ipcMain.eventNames();
    }, getMaxListeners(): number {
        return ipcMain.getMaxListeners();
    }, handle(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => (Promise<void> | any)): void {
        ipcMain.handle(channel, listener);
    }, handleOnce(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => (Promise<void> | any)): void {
        ipcMain.handleOnce(channel, listener);
    }, listenerCount(type: string | symbol): number {
        return ipcMain.listenerCount(type);
    }, listeners(event: string | symbol): Function[] {
        return ipcMain.listeners(event);
    }, on(event: string, listener: ((...args: any[]) => void)
        | ((event: Electron.IpcMainEvent, ...args: any[]) => void)): IpcMain {
        return ipcMain.on(event, (e, ...args) => {
            const send = e.sender.send;
            e.sender.send = (...args2) => {
                args2 = registryCallback(e.sender, args2);
                send.call(e.sender, ...args2);
            };
            listener(e, ...analysisCallback(args));
        });
    }, once(event: string, listener: ((...args: any[]) => void)
        | ((event: Electron.IpcMainEvent, ...args: any[]) => void)): IpcMain {
        return ipcMain.once(event, listener);
    }, prependListener(event: string | symbol, listener: (...args: any[]) => void): IpcMain {
        return ipcMain.prependListener(event, listener);
    }, prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): IpcMain {
        return ipcMain.prependOnceListener(event, listener);
    }, removeAllListeners(event?: string): IpcMain {
        return ipcMain.removeAllListeners(event);
    }, removeHandler(channel: string): void {
        ipcMain.removeHandler(channel);
    }, removeListener(channel: string, listener: (...args: any[]) => void): IpcMain {
        return ipcMain.removeListener(channel, listener);
    }, setMaxListeners(n: number): IpcMain {
        return ipcMain.setMaxListeners(n);
    }
};

function initUtilListener() {
    // 是否为mac
    ipcMainProxy.on('ngx-electron-is-mac', event => event.returnValue = isMac());
    // 是否为windows
    ipcMainProxy.on('ngx-electron-is-windows', event => event.returnValue = isWindows());
    // 是否为linux
    ipcMainProxy.on('ngx-electron-is-linux', event => event.returnValue = isLinux());

    // 执行回调函数
    ipcMainProxy.on('ngx-electron-renderer-registry-callback', (event, callbackId) => {
        rendererCallbackMap.set(callbackId, (...args) => {
            event.sender.send('ngx-electron-main-execute-callback', callbackId, ...args);
        });
        event.returnValue = null;
    });

    ipcMainProxy.on('ngx-electron-renderer-execute-callback', (event, callbackId, ...args) => {
        const value = mainCallbackMap.get(callbackId);
        console.log(1111);
        value(...args);
        event.returnValue = null;
    });
    ipcMain.on('ngx-electron-renderer-json-parse', (event, json) => {
        event.returnValue = json;
    });
}

function registryCallback(sender: WebContents, obj, cache = []) {
    if (proxy_set.has(obj) || cache.includes(obj)) {
        return;
    }
    cache.push(obj);
    if (obj instanceof Function) {
        const callbackId = uuidv4();
        mainCallbackMap.set(callbackId, obj);
        sender.send('ngx-electron-main-registry-callback', callbackId);
        return {
            type: 'ngx-electron-callback',
            id: callbackId
        };
    } else if (obj instanceof Array) {
        return obj.map(o => registryCallback(sender, o, cache));
    } else if (obj instanceof Object) {
        for (const key of Object.keys(obj)) {
            if (obj[key] instanceof Function) {
                try {
                    JSON.stringify(obj);
                } catch (e) {
                    return obj;
                }
                obj[key] = registryCallback(sender, obj[key], cache);
            } else {
                registryCallback(sender, obj[key], cache);
            }
        }
    }
    return obj;
}

function analysisCallback(obj, cache = []) {
    if (cache.includes(obj)) {
        return null;
    }
    cache.push(obj);
    if (obj instanceof Array) {
        return obj.map(o => analysisCallback(o));
    } else if (obj instanceof Object) {
        if (obj.type === 'ngx-electron-callback') {
            return rendererCallbackMap.get(obj.id);
        }
        for (const key of Object.keys(obj)) {
            if (obj[key] instanceof Object && obj[key].type === 'ngx-electron-callback') {
                obj[key] = analysisCallback(obj[key], cache);
            } else {
                analysisCallback(obj[key], cache);
            }
        }
    }
    return obj;
}

export {isMac, isWindows, isLinux, initUtilListener, ipcMainProxy};
