import { v4 as uuidv4 } from 'uuid';
import {IpcRenderer} from 'electron';


export class IpcRendererProxy implements IpcRenderer {

    /**
     * 用于存放渲染进程中的回调 对应的 channel
     */
    private callbackMap = new Map<Function, string>();

    constructor(private ipcRenderer: IpcRenderer) {
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
        this.ipcRenderer.on(channel, listener);
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
        this.registryCallbackFunction(args);
        this.ipcRenderer.send(channel, ...args);
    }

    sendSync(channel: string, ...args: any[]): any {
        this.ipcRenderer.sendSync(channel, ...args);
    }

    sendTo(webContentsId: number, channel: string, ...args: any[]): void {
        this.ipcRenderer.sendTo(webContentsId, channel, ...args);
    }

    sendToHost(channel: string, ...args: any[]): void {
        this.ipcRenderer.sendToHost(channel, ...args);
    }

    setMaxListeners(n: number): this {
        this.ipcRenderer.setMaxListeners(n);
        return this;
    }

    registryCallbackFunction(obj: any): any {
        if (obj instanceof Function) {
            const uuid = uuidv4();
            this.ipcRenderer.sendSync('ngx-electron-renderer-registry-callback-function', uuid);
            return {
                type: 'ngx-electron-callback-function',
                id: uuid
            };
        } else if (obj instanceof Array) {
            return obj.map(o => this.registryCallbackFunction(o));
        } else if (obj instanceof Object) {
            for (const key of Object.keys(obj)) {
                obj[key] = this.registryCallbackFunction(obj[key]);
            }
            return obj;
        }
    }


}
