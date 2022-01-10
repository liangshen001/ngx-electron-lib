/*
import {IpcMain, IpcMainEvent, IpcRenderer, IpcRendererEvent, WebContents} from 'electron';
import {NgZone} from '@angular/core';
import {isRenderer, proxySet} from '../../utils/utils';
import {ChannelsMap} from './ngx-electron-ipc-proxy';
import { NgxElectronIpcMainProxy } from './ngx-electron-ipc-main-proxy';
import { NgxElectronIpcRendererProxy } from './ngx-electron-ipc-renderer-proxy';

export class NgxElectronIpcProxyUtil {

    /!**
     * 用于存放进程中的channel 对应的 回调
     *!/
    private static callbackMap = new Map<number, Function>();

    /!**
     * 用于存放进程中的回调 对应的 channel  用于解决回调参数中 多处使用同一个函数对象的情况
     *!/
    private static callbackMap2 = new Map<Function, number>();

    /!**
     * 主要解决ipc传参数不能传加调函数问题
     * @param ipc
     * @param ngZone?
     *!/
    public static proxy<T extends ChannelsMap>(ipc: IpcRenderer | IpcMain, ngZone?: NgZone): NgxElectronIpcMainProxy<T>;
    public static proxy<T extends ChannelsMap>(ipc: IpcRenderer, ngZone?: NgZone): NgxElectronIpcRendererProxy<T>;
    public static proxy<T extends ChannelsMap>(ipc: IpcMain | IpcRenderer, ngZone?: NgZone):
        NgxElectronIpcMainProxy<T> | NgxElectronIpcRendererProxy<T> {

        const ipcProxy = new Proxy(ipc, {
            get(target: Electron.IpcMain | Electron.IpcRenderer, p: PropertyKey, receiver: any): any {
                const cache = Reflect.get(target, p, receiver);
                if (cache) {
                    return cache;
                }
                const value = target[p];
                Reflect.set(target, p, value, receiver)
                return value;
            },
            set(target: Electron.IpcMain | Electron.IpcRenderer, p: PropertyKey, value: any, receiver: any): boolean {
                return Reflect.set(target, p, value, receiver);
            }
        });

        // 对ipc的on方法进行代理
        const ipcOn = ipcProxy.on;
        ipcProxy.on = (channel, listener) => {
            return ipcOn.call(ipcProxy, channel, (event: IpcMainEvent | IpcRendererEvent, ...args) => {
                console.log(`${isRenderer ? 'IpcRenderer' : 'IpcMain'}.on(${channel}, ${args.map(i => JSON.stringify(i)).join(',')})`);
                args = this.analysisCallback(event.sender, args);
                listener(event, ...args);
            });
        }
        // 监听 对方进程 执行回调的channel
        const applyCallbackChannel = `ngx-electron-apply-${isRenderer ? 'main' : 'renderer'}-callback`;
        ipcProxy.on(applyCallbackChannel, (event, callbackId, ...args) => {
            this.callbackMap.get(callbackId)(...args);
            // event.returnValue = null;
        });
        // 渲染进程中需要 对ipcRenderer的发送方法进行代理
        if (isRenderer) {
            const ipcRenderer = ipcProxy as IpcRenderer;
            // this.proxyIpcSender(ipcRenderer, ngZone);
            return new NgxElectronIpcRendererProxy(ipcRenderer, ngZone);
        } else {
            const ipcMain = ipcProxy as IpcMain;
            // ngxElectronIpcMainProxy = new Proxy(ipc as IpcMain, {
            //     get(target: Electron.IpcMain, p: PropertyKey, receiver: any): any {
            //         return Reflect.get(target, p, receiver);
            //     }
            // }) as NgxElectronIpcMainProxy<T>;

            return new NgxElectronIpcMainProxy(ipcMain);
        }
    }

    /!**·
     * 代理sender 代理方法有send|sendSync|sendTo|sendToHost
     * @private
     *!/
    public static proxyIpcSender(sender: IpcRenderer | WebContents, ngZone?: NgZone) {
        ['send', 'sendSync', 'sendTo', 'sendToHost'].forEach(methodName => this.proxyIpcSenderMethod(sender, methodName, ngZone))
    }


    /!**
     * 代理sender的指定方法   参数注册回调
     * @private
     *!/
    private static proxyIpcSenderMethod(sender: IpcRenderer | WebContents,
                                        methodName: string, ngZone?: NgZone) {
        const senderMethodTemp = sender[methodName];
        sender[methodName] = (...args: any[]) => {
            args = this.registryCallback(sender, args, [], ngZone);
            console.log(`${isRenderer ? 'IpcRenderer' : 'WebContents'}.${methodName}(${args.map(i => JSON.stringify(i)).join(', ')})`);
            const returnValue = senderMethodTemp.apply(sender, args);
            if (returnValue !== undefined) {
                return this.analysisCallback(sender, returnValue);
            }
        }
    }

    private static registryCallback(sender: IpcRenderer | WebContents, obj: any, cache: any[], ngZone?: NgZone): any {
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
        if (cache.includes(obj) || proxySet.has(obj)) {
            return null;
        }
        cache.push(obj);
        if (obj instanceof Array) {
            return obj.map(o => this.registryCallback(sender, o, cache, ngZone));
        } else if (obj instanceof Object) {
            const newObj = {};
            for (const key of Object.keys(obj)) {
                newObj[key] = this.registryCallback(sender, obj[key], cache, ngZone);
            }
        }
        return obj;
    }

    private static analysisCallback(sender: IpcRenderer | WebContents, obj, objs = []) {
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
*/
