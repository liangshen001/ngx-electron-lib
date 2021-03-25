import {IpcRenderer, RendererInterface} from 'electron';
import {NgZone} from '@angular/core';


const proxy_set = new WeakSet();
global.Proxy = new Proxy(Proxy, {
    construct(target, args: any) {
        // @ts-ignore
        const proxy = new target(...args);
        proxy_set.add(proxy);
        return proxy;
    }
});

export class IpcRendererProxy {

    /**
     * 用于存放渲染进程中的channel 对应的 回调
     */
    private static callbackMap = new Map<number, Function>();

    /**
     * 用于存放渲染进程中的回调 对应的 channel  用于解决回调参数中 多处使用同一个函数对象的情况
     */
    private static callbackMap2 = new Map<Function, number>();

    public static proxy(electron: RendererInterface, ngZone: NgZone) {
        const ipcRendererOn = electron.ipcRenderer.on;
        electron.ipcRenderer.on = (channel, listener) => {
            return ipcRendererOn.call(electron.ipcRenderer, channel, (event, ...args) => {
                console.log(`IpcMain.on(${channel}, ${args.map(i => JSON.stringify(i)).join(',')})`);
                args = this.analysisCallback(event.sender, args);
                listener(event, ...args);
            });
        }

        electron.ipcRenderer.on('ngx-electron-main-execute-renderer-callback', (event, callbackId, ...args) => {
            this.callbackMap.get(callbackId)(...args);
            event.returnValue = null;
        });
        this.proxyIpcRenderer(electron.ipcRenderer, ngZone);
    }

    /**
     * 代理sender 代理方法有send|sendSync|sendTo|sendToHost
     * @private
     */
    private static proxyIpcRenderer(sender: IpcRenderer, ngZone: NgZone) {
        this.proxyIpcRendererMethod(sender, 'send', ngZone);
        this.proxyIpcRendererMethod(sender, 'sendSync', ngZone);
        this.proxyIpcRendererMethod(sender, 'sendTo', ngZone);
        this.proxyIpcRendererMethod(sender, 'sendToHost', ngZone);
    }


    /**
     * 代理sender的指定方法   参数注册回调
     * @private
     */
    private static proxyIpcRendererMethod(sender: IpcRenderer, methodName: 'send' | 'sendSync' | 'sendTo' | 'sendToHost', ngZone: NgZone) {
        const senderMethodTemp = sender[methodName];
        sender[methodName] = (...args: any[]) => {
            args = this.registryCallback(sender, args, [], ngZone);
            console.log(`IpcRenderer.${methodName}(${args.map(i => JSON.stringify(i)).join(', ')})`);
            senderMethodTemp.apply(sender, args);
        }
    }

    private static registryCallback(ipcRenderer: Electron.IpcRenderer, obj: any, cache: any[], ngZone?: NgZone): any {
        if (obj instanceof Function) {
            if (cache.includes(obj)) {
                if (obj instanceof Function) {
                    return {
                        type: 'ngx-electron-callback',
                        id: this.callbackMap2.get(obj)
                    };
                }
                return null;
            }
            cache.push(obj);
            const callbackId = Math.random();
            this.callbackMap2.set(obj, callbackId);
            this.callbackMap.set(callbackId, (...args) => {
                if (ngZone) {
                    ngZone.run(() => setTimeout(() => obj(...args)));
                } else {
                    obj(...args);
                }
            });
            return {
                type: 'ngx-electron-callback',
                id: callbackId
            };
        }
        if (cache.includes(obj) || proxy_set.has(obj)) {
            return null;
        }
        cache.push(obj);
        if (obj instanceof Array) {
            return obj.map(o => this.registryCallback(ipcRenderer, o, cache, ngZone));
        } else if (obj instanceof Object) {
            const newObj = {};
            for (const key of Object.keys(obj)) {
                newObj[key] = this.registryCallback(ipcRenderer, obj[key], cache, ngZone);
            }
        }
        return obj;
    }

    private static analysisCallback(sender: IpcRenderer, obj, objs = []) {
        if (objs.includes(obj)) {
            return null;
        }
        objs.push(obj);
        if (obj instanceof Array) {
            return obj.map(o => this.analysisCallback(sender, o, objs));
        } else if (obj instanceof Object) {
            if (obj.type === 'ngx-electron-callback') {
                return (...args) => sender.send('ngx-electron-renderer-execute-main-callback', obj.id, ...args)
            }
            for (const key of Object.keys(obj)) {
                if (obj[key] instanceof Object && obj[key].type === 'ngx-electron-callback') {
                    obj[key] = this.analysisCallback(sender, obj[key], objs);
                } else {
                    this.analysisCallback(sender, obj[key], objs);
                }
            }
        }
        return obj;
    }

}
