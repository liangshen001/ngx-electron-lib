import {v4 as uuidv4} from 'uuid';
import {IpcRenderer} from 'electron';
import {NgZone} from '@angular/core';
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

export class IpcRendererProxy implements IpcRenderer {

    /**
     * 用于存放渲染进程中的回调 对应的 channel
     */
    private callbackMap = new Map<String, Function>();
    private callbackMap2 = new Map<Function, string>();

    private mainCallbackMap = new Map<String, Function>();

    constructor(private ipcRenderer: IpcRenderer, private ngZone: NgZone) {
        this.on('ngx-electron-main-execute-callback', (event, callbackId, ...args) => {
            const value = this.callbackMap.get(callbackId);
            value(...args);
            event.returnValue = null;

        });
        this.on('ngx-electron-main-registry-callback', (event, callbackId) => {
            this.mainCallbackMap.set(callbackId, () => {
                event.sender.send('ngx-electron-renderer-execute-callback', callbackId);
            });
            event.returnValue = null;
        });
    }

    addListener(event: string | symbol, listener: (...args: any[]) => void): this {
        this.ipcRenderer.addListener(event, listener);
        return this;
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        return this.ipcRenderer.emit(event, ...args);
    }

    eventNames(): Array<string | symbol> {
        return this.ipcRenderer.eventNames();
    }

    getMaxListeners(): number {
        return this.ipcRenderer.getMaxListeners();
    }

    invoke(channel: string, ...args: any[]): Promise<any> {
        return this.ipcRenderer.invoke(channel, ...args);
    }

    listenerCount(type: string | symbol): number {
        return this.ipcRenderer.listenerCount(type);
    }

    listeners(event: string | symbol): Function[] {
        return this.ipcRenderer.listeners(event);
    }

    on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    on(channel: string, listener: ((event: Electron.IpcRendererEvent, ...args: any[]) => void)
        | ((...args: any[]) => void)): this {
        this.ipcRenderer.on(channel, (event, ...args) => {
            const send = event.sender.send;
            const sendSync = event.sender.sendSync;
            event.sender.send = (...args2) => {
                args2 = this.registryCallback(args2);
                send.call(event.sender, ...args2);
            };
            event.sender.sendSync = (...args2) => {
                args2 = this.registryCallback(args2);
                sendSync.call(event.sender, ...args2);
            };
            args = this.analysisCallback(args);
            listener(event, ...args);
        });
        return this;
    }

    once(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    once(channel: string, listener: ((event: Electron.IpcRendererEvent, ...args: any[]) => void)
        | ((...args: any[]) => void)): this {
        this.ipcRenderer.once(channel, listener);
        return this;
    }

    prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
        this.ipcRenderer.prependListener(event, listener);
        return this;
    }

    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        this.ipcRenderer.prependOnceListener(event, listener);
        return this;
    }

    removeAllListeners(channel: string): this;
    removeAllListeners(event?: string | symbol): this;
    removeAllListeners(channel?: string): this {
        this.ipcRenderer.removeAllListeners(channel);
        return this;
    }

    removeListener(channel: string, listener: (...args: any[]) => void): this;
    // tslint:disable-next-line:unified-signatures
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(channel: string, listener: (...args: any[]) => void): this {
        this.ipcRenderer.removeListener(channel, listener);
        return this;
    }

    send(channel: string, ...args: any[]): void {
        args = this.registryCallback(args);
        this.ipcRenderer.send(channel, ...args);
    }

    sendSync(channel: string, ...args: any[]): any {
        args = this.registryCallback(args);
        console.log(args);
        this.ipcRenderer.sendSync(channel, ...args);
    }

    sendTo(webContentsId: number, channel: string, ...args: any[]): void {
        args = this.registryCallback(args);
        this.ipcRenderer.sendTo(webContentsId, channel, ...args);
    }

    sendToHost(channel: string, ...args: any[]): void {
        args = this.registryCallback(args);
        this.ipcRenderer.sendToHost(channel, ...args);
    }

    setMaxListeners(n: number): this {
        this.ipcRenderer.setMaxListeners(n);
        return this;
    }

    private registryCallback(obj: any, cache = []): any {
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
            const callbackId = uuidv4();
            this.callbackMap2.set(obj, callbackId);
            this.callbackMap.set(callbackId, (...args) => this.ngZone.run(() => setTimeout(() => obj(...args))));
            this.send('ngx-electron-renderer-registry-callback', callbackId);
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
            return obj.map(o => this.registryCallback(o, cache));
        } else if (obj instanceof Object) {
            const newObj = {};
            for (const key of Object.keys(obj)) {
                newObj[key] = this.registryCallback(obj[key], cache);
            }
        }
        return obj;
    }

    private analysisCallback(obj, objs = []) {
        if (objs.includes(obj)) {
            return null;
        }
        objs.push(obj);
        if (obj instanceof Array) {
            return obj.map(o => this.analysisCallback(o, objs));
        } else if (obj instanceof Object) {
            if (obj.type === 'ngx-electron-callback') {
                return this.mainCallbackMap.get(obj.id);
            }
            for (const key of Object.keys(obj)) {
                if (obj[key] instanceof Object && obj[key].type === 'ngx-electron-callback') {
                    obj[key] = this.analysisCallback(obj[key], objs);
                } else {
                    this.analysisCallback(obj[key], objs);
                }
            }
        }
        return obj;
    }


}
