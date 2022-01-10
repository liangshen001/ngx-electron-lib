import {ObservableUtil} from "./observable-util";
import {NgxElectronProxy} from "../..";

export class ProxyUtil {
    static get(target: any, p: PropertyKey, receiver: any, ngxElectronProxy: NgxElectronProxy<any>, cache: Map<string, any>, proxyPropertyMap: Map<string, Function>, addPropertyMap: Map<string, string[]>) {
        if (typeof p === 'string') {
            if (addPropertyMap.has(p) || proxyPropertyMap.has(p)) {
                if (!cache.has(p)) {
                    let obj;
                    if (addPropertyMap.has(p)) {
                        let argNames = addPropertyMap.get(p);
                        obj = ObservableUtil.getPropertyObservable(target, p, ...argNames);
                    } else {
                        let proxyMethods = proxyPropertyMap.get(p);
                        obj = proxyMethods(ngxElectronProxy, target);
                    }
                    cache.set(p, obj);
                }
                debugger;
                return cache.get(p);
            }
        }
        return Reflect.get(target, p, receiver);
    }
}
