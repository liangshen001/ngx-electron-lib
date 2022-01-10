import {Observable} from 'rxjs';

export class ObservableUtil {

    /**
     * 创建可响应对象
     */
    public static newObservable<T, P extends keyof T>(target: NodeJS.EventEmitter, type: 'on' | 'once',
                                                      event: string | any, ...argNames: P[]): Observable<T> {
        const isOn = type === 'on';
        return new Observable<T>(subscriber => {
            const callback = (...args: any[]) => {
                subscriber.next(argNames.reduce((p, v, i) => ({
                    ...p,
                    [v]: args[i]
                }), {} as T));
                if (isOn) {
                    subscriber.complete();
                }
            };
            target[type](event, callback);
            if (isOn) {
                return () => target.removeListener(event, callback);
            }
        });
    }

    /**
     * 创建一对 可响应对象 第一个不关闭的流  第二个只发射一次关闭的流
     */
    public static newObservables<T, P extends keyof T>(target: NodeJS.EventEmitter, event: string | any,
                                                       ...argNames: any[]): [Observable<T>, Observable<T>] {
        return [
            ObservableUtil.newObservable<T, P>(target, 'on', event, ...argNames),
            ObservableUtil.newObservable<T, P>(target, 'once', event, ...argNames)
        ];
    }

    static getPropertyObservable(target: NodeJS.EventEmitter, p: string, ...argNames: string[]) {
        const type =  p.startsWith('once') ? 'once' : 'on';
        if (['onChannel', 'onceChannel'].includes(p)) {
            return event => ObservableUtil.newObservable<any, any>(target, type, event, ...argNames);
        }
        const event = this.toLine(p.substring(type.length));
        return ObservableUtil.newObservable<any, any>(target, type, event, ...argNames);
    }
    private static toLine(name: string) {
        return name.replace(/([A-Z])/g, ((substring, args) => {
            const lowerCase = substring.toLocaleLowerCase();
            return args[1] ? (`-${lowerCase}`) : lowerCase;
        }));
    }
}
