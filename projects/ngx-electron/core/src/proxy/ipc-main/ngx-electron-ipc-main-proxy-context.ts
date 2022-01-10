import {IpcMain} from "electron";
import {NgxElectronIpcMainProxy} from "./ngx-electron-ipc-main-proxy";
import {ChannelsMap} from "../ipc/ngx-electron-ipc-proxy";
import {NgxElectronProxy} from "../ngx-electron-proxy";
import {ProxyUtil} from "../../utils/proxy-util";

export class NgxElectronIpcMainProxyContext {

    private static proxyPropertyMap = new Map();

    private static addPropertyMap = new Map([
        ['onChannel', ['event', 'data']],
        ['onceChannel', ['event', 'data']]
    ]);

    static proxy<T extends ChannelsMap>(electron: NgxElectronProxy<T>, ipcMain: IpcMain): NgxElectronIpcMainProxy<T> {
        if (!ipcMain) {
            return;
        }
        const cache = new Map<string, any>();
        return new Proxy(ipcMain, {
            get(target: Electron.IpcMain, p: PropertyKey, receiver: any): any {
                return ProxyUtil.get(target, p, receiver, electron, cache,
                    NgxElectronIpcMainProxyContext.proxyPropertyMap, NgxElectronIpcMainProxyContext.addPropertyMap)
            }
        }) as NgxElectronIpcMainProxy<T>;
    }
}
