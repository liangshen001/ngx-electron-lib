import {IpcRenderer} from "electron";
import {ChannelsMap} from "../ipc/ngx-electron-ipc-proxy";
import {NgxElectronIpcRendererProxy} from "./ngx-electron-ipc-renderer-proxy";
import {NgxElectronProxy} from "../ngx-electron-proxy";
import {ProxyUtil} from "../../utils/proxy-util";

export class NgxElectronIpcRendererProxyContext {

    static proxyPropertyMap = new Map();
    static addPropertyMap = new Map([
        ['onChannel', ['event', 'data']],
        ['onceChannel', ['event', 'data']]
    ]);

    static proxy<T extends ChannelsMap>(electron: NgxElectronProxy<T>, ipcRenderer: IpcRenderer): NgxElectronIpcRendererProxy<T> {
        if (!ipcRenderer) {
            return;
        }
        const cache = new Map();
        return new Proxy(ipcRenderer, {
            get(target: Electron.IpcRenderer, p: PropertyKey, receiver: any): any {
                return ProxyUtil.get(target, p, receiver, electron, cache,
                    NgxElectronIpcRendererProxyContext.proxyPropertyMap, NgxElectronIpcRendererProxyContext.addPropertyMap)
            }
        }) as NgxElectronIpcRendererProxy<T>;
    }
}
