import {NgxElectronRemoteProxy} from './ngx-electron-remote-proxy';
import {NgxElectronProxy} from '../ngx-electron-proxy';
import {ChannelsMap} from '../ipc/ngx-electron-ipc-proxy';
import {Remote} from 'electron';
import {NgxElectronBrowserWindowProxyContext} from '../browser-window/ngx-electron-browser-window-proxy-context';
import {ProxyUtil} from "../../utils/proxy-util";

export class NgxElectronRemoteProxyContext {


    private static proxyPropertyMap = new Map([
        ['BrowserWindow', <T extends ChannelsMap>(ngxElectronProxy: NgxElectronProxy<T>, remote: Remote) => NgxElectronBrowserWindowProxyContext.proxy(ngxElectronProxy, remote.BrowserWindow)]
    ]);
    private static addPropertyMap = new Map();

    static proxy<T extends ChannelsMap>(ngxElectronProxy: NgxElectronProxy<T>, remote: Remote): NgxElectronRemoteProxy {
        if (!remote) {
            return;
        }
        const cache = new Map<string, any>();
        return new Proxy(remote, {
            get(target: Electron.Remote, p: PropertyKey, receiver: any): any {
                return ProxyUtil.get(target, p, receiver, ngxElectronProxy, cache,
                    NgxElectronRemoteProxyContext.proxyPropertyMap, NgxElectronRemoteProxyContext.addPropertyMap);
            }
        }) as NgxElectronRemoteProxy;
    }
}
