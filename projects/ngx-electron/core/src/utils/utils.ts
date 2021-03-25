
// 被代理的对象 用于判断一个对象是否为被代理的对象
import {CommonInterface, ipcRenderer} from 'electron';
import * as electron from 'electron';

export const proxySet = new WeakSet();
Proxy = new Proxy(Proxy, {
    construct(target, args: any) {
        // @ts-ignore
        const proxy = new target(...args);
        proxySet.add(proxy);
        return proxy;
    }
});

export const isRenderer = (!process || process.type === 'renderer') && ipcRenderer


// 代理BrowserWindow类
export const commonInterface: CommonInterface = isRenderer ? electron.remote : electron;
