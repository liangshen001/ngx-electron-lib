import {IpcRenderer, Remote, Tray, Menu, NativeImage, DisplayBalloonOptions, Rectangle, Point, RendererInterface} from 'electron';
import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs';
import {IpcRendererProxy} from './ipc-renderer-proxy';


export class TrayProxy implements Tray {

    click = new Observable(subscriber => {
        this.on('click', () => subscriber.next());
    });
    balloonClick = new Observable(subscriber => {
        this.on('balloon-click', () => subscriber.next());
    });
    balloonClosed = new Observable(subscriber => {
        this.on('balloon-closed', () => subscriber.next());
    });
    balloonShow = new Observable(subscriber => {
        this.on('balloon-show', () => subscriber.next());
    });
    doubleClick = new Observable(subscriber => {
        this.on('double-click', () => subscriber.next());
    });
    dragEnd = new Observable(subscriber => {
        this.on('drag-end', () => subscriber.next());
    });
    dragEnter = new Observable(subscriber => {
        this.on('drag-enter', () => subscriber.next());
    });
    dragLeave = new Observable(subscriber => {
        this.on('drag-leave', () => subscriber.next());
    });
    drop = new Observable(subscriber => {
        this.on('drop', () => subscriber.next());
    });
    dropFiles = new Observable(subscriber => {
        this.on('drop-files', () => subscriber.next());
    });
    dropText = new Observable(subscriber => {
        this.on('drop-text', () => subscriber.next());
    });
    mouseEnter = new Observable(subscriber => {
        this.on('mouse-enter', () => subscriber.next());
    });
    mouseLeave = new Observable(subscriber => {
        this.on('mouse-leave', () => subscriber.next());
    });
    mouseMove = new Observable(subscriber => {
        this.on('mouse-move', () => subscriber.next());
    });
    rightClick = new Observable(subscriber => {
        this.on('right-click', () => subscriber.next());
    });

    constructor(private electron: RendererInterface, private ipcRenderer: IpcRendererProxy,
                private remote: Remote, private ngZone: NgZone) {
    }

    create(image): void {
        this.ipcRenderer.sendSync('ngx-electron-renderer-create-tray', image);
    }

    destroy(): void {
        if (this.isDestroyed()) {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'destroy');
        }
    }

    setContextMenu(menu: Menu | null): void {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            // const timestamp = new Date().getTime();
            // this.ipcRenderer.on(`ngx-electron-click-tray-context-menu-item-${timestamp}`, (event, i) => {
            //     const item = menu.items.find((value, index) => index === i);
            //     this.ngZone.run(() => setTimeout(() => {
            //         if (item.click) {
            //             item.click(null, null, null);
            //         }
            //     }));
            // });
            // this.ipcRenderer.sendSync('ngx-electron-renderer-set-tray-context-menu', menu.items, timestamp);
            // this.ipcRenderer.sendSync('ngx-electron-renderer-set-tray-context-menu', menu.items.map(item => ({
            //     ...this.electron.ipcRenderer.sendSync('ngx-electron-renderer-json-parse', item),
            //     click: item.click
            // })));
            this.ipcRenderer.sendSync('ngx-electron-renderer-set-tray-menu-items', menu.items);
        }
    }

    setImage(image: NativeImage | string): void {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setImage', image);
        }
    }

    setTitle(title: string): void {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setTitle', title);
        }
    }

    setToolTip(toolTip: string): void {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setToolTip', toolTip);
        }
    }

    /***************************/

    displayBalloon(options: DisplayBalloonOptions): void {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.send('ngx-electron-tray-apply-method', 'displayBalloon', options);
        }
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        return false;
    }

    eventNames(): Array<string | symbol> {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
            return null;
        } else {
            return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'eventNames');
        }
    }

    getBounds(): Rectangle {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
            return null;
        }
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'getBounds');
    }

    getIgnoreDoubleClickEvents(): boolean {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
            return null;
        }
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'getIgnoreDoubleClickEvents');
    }

    getMaxListeners(): number {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
            return null;
        }
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'getMaxListeners');
    }

    getTitle(): string {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
            return null;
        }
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'getTitle');
    }

    isDestroyed(): boolean {
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'isDestroyed');
    }

    listenerCount(type: string | symbol): number {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
            return null;
        }
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'listenerCount', type);
    }

    listeners(event: string | symbol): [] {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
            return null;
        }
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'listeners', event);
    }

    popUpContextMenu(menu?: Menu, position?: Point): void {
    }

    setIgnoreDoubleClickEvents(ignore: boolean): void {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setIgnoreDoubleClickEvents', ignore);
        }
    }

    setPressedImage(image: NativeImage | string): void {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setPressedImage', image);
        }
    }

    setMaxListeners(n: number): this {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setMaxListeners', n);
        }
        return this;
    }

    prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
        return this;
    }

    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        return this;
    }

    removeAllListeners(event?: string | symbol): this {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'removeAllListeners', event);
        }
        return this;
    }

    removeListener(event: any, listener: any): this {
        return this;
    }
    addListener(event: any, listener: any): this {
        return this.on(event, listener);
    }

    on(event: any, listener: any): this {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'on', event, listener);
        }
        return this;
    }

    once(event, listener): this {
        if (this.isDestroyed()) {
            console.warn('Tray has been destroyed');
        } else {
            this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'once', event, listener);
        }
        return this;
    }

    /* node12 */
    rawListeners(event: string | symbol): Function[] {
        return [];
    }
    off(event: string | symbol, listener: (...args: any[]) => void): this {
        return this;
    }

}
