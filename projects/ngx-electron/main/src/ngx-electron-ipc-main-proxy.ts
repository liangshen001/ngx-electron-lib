import {IpcMain, ipcMain, IpcRenderer, WebContents} from 'electron';
import {NgZone} from '@angular/core';

const proxy_set = new WeakSet();
Proxy = new Proxy(Proxy, {
    construct(target, args: any) {
        const proxy = Reflect.construct(target, args);
        proxy_set.add(proxy);
        return proxy;
    }
});
// 存放主进程中回调函数map
const mainCallbackMap = new Map<number, Function>();

export function proxyIpcMainOn() {
    const ipcMainOnFunction = ipcMain.on;
    ipcMain.on = (channel, listener): IpcMain => {
        return ipcMainOnFunction.call(ipcMain, channel, (event, ...args) => {
            console.log(`IpcMain.on(${channel}, ${args.map(i => JSON.stringify(i)).join(',')})`);
            listener(event, ...analysisCallback(event.sender, args));
        });
    }

    // 执行渲染进程中的回调函数
    ipcMain.on('ngx-electron-renderer-execute-main-callback', (event, callbackId, ...args) => {
        mainCallbackMap.get(callbackId)(...args);
        event.returnValue = null;
    });
}

export function proxyWebContents(sender: WebContents) {
    proxyWebContentsMethod(sender, 'send');
    proxyWebContentsMethod(sender, 'sendSync');
    proxyWebContentsMethod(sender, 'sendTo');
    proxyWebContentsMethod(sender, 'sendToHost');
}
function proxyWebContentsMethod(sender: WebContents, methodName: 'send' | 'sendSync' | 'sendTo' | 'sendToHost') {
    const senderMethodTemp = sender[methodName];
    sender[methodName] = (...args: any[]) => {
        args = registryCallback(sender, args);
        console.log(`IpcRenderer.${methodName}(${args.map(i => JSON.stringify(i)).join(', ')})`);
        senderMethodTemp.apply(sender, args);
    }
}


function registryCallback(sender: WebContents, obj, cache = []) {
    if (proxy_set.has(obj) || cache.includes(obj)) {
        return;
    }
    cache.push(obj);
    if (obj instanceof Function) {
        const callbackId = Math.random();
        mainCallbackMap.set(callbackId, obj);
        return {
            type: 'ngx-electron-callback',
            id: callbackId
        };
    } else if (obj instanceof Array) {
        return obj.map(o => registryCallback(sender, o, cache));
    } else if (obj instanceof Object) {
        for (const key of Object.keys(obj)) {
            if (obj[key] instanceof Function) {
                // TODO
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

function analysisCallback(sender: WebContents, obj: any, cache = []) {
    if (cache.includes(obj)) {
        return null;
    }
    cache.push(obj);
    if (obj instanceof Array) {
        return obj.map(o => analysisCallback(sender, o));
    } else if (obj instanceof Object) {
        if (obj.type === 'ngx-electron-callback') {
            return (...args) => {
                sender.send('ngx-electron-main-execute-renderer-callback', obj.id, ...args);
            };
        } else {
            const newObj: any = {};
            for (const key of Object.keys(obj)) {
                // if (obj[key] instanceof Object && obj[key].type === 'ngx-electron-callback') {
                newObj[key] = analysisCallback(sender, obj[key], cache);
                // } else {
                //     analysisCallback(obj[key], cache);
                // }
            }
            return newObj;
        }
    }
    return obj;
}
