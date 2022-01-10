import {CommonInterface, App, BrowserWindow} from 'electron';
import {NgxElectronAppProxy} from './ngx-electron-app-proxy';
import {ObservableUtil} from '../../utils/observable-util';
import {ChannelsMap} from '../ipc/ngx-electron-ipc-proxy';
import {NgxElectronProxy} from '../ngx-electron-proxy';
import {ProxyUtil} from "../../utils/proxy-util";


export class NgxElectronAppProxyContext {

    private static addPropertyMap = new Map([
        ['onBrowserWindowCreated', ['event', 'window']]
    ]);
    private static proxyPropertyMap = new Map();

    static proxy<T extends ChannelsMap>(ngxElectronProxy: NgxElectronProxy<T>, app: App): NgxElectronAppProxy {
        if (!app) {
            return;
        }
        const cache = new Map<string, any>();
        return new Proxy(app, {
            get(target: Electron.App, p: PropertyKey, receiver: any): any {
                return ProxyUtil.get(target, p, receiver, ngxElectronProxy, cache,
                    NgxElectronAppProxyContext.proxyPropertyMap, NgxElectronAppProxyContext.addPropertyMap);
            }
        }) as NgxElectronAppProxy;
    }
}
