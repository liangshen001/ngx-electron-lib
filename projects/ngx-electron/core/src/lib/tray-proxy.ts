import {IpcRenderer, Remote, Tray, Menu, NativeImage, DisplayBalloonOptions, Rectangle, Point} from 'electron';
import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs';


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

    constructor(private ipcRenderer: IpcRenderer, private remote: Remote, private ngZone: NgZone) {
    }

    create(image): void {
        this.ipcRenderer.sendSync('ngx-electron-renderer-create-tray', image);
    }

    destroy(): void {
        this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'destroy');
    }

    on(event: any, listener: any): this {
        const timestamp = new Date().getTime();
        this.ipcRenderer.on(`ngx-electron-tray-on-${event}-${timestamp}`, listener);
        this.ipcRenderer.sendSync(`ngx-electron-tray-on-event`, event, timestamp);
        return this;
    }

    once(event, listener): this {
        const timestamp = new Date().getTime();
        this.ipcRenderer.on(`ngx-electron-tray-once-${event}-${timestamp}`, listener);
        this.ipcRenderer.sendSync(`ngx-electron-tray-once-event`, event, timestamp);
        return this;
    }

    setContextMenu(menu: Menu | null): void {
        const timestamp = new Date().getTime();
        this.ipcRenderer.on(`ngx-electron-click-tray-context-menu-item-${timestamp}`, (event, i) => {
            const item = menu.items.find((value, index) => index === i);
            this.ngZone.run(() => setTimeout(() =>
                item.click && item.click(null, null, null)));
        });
        this.ipcRenderer.sendSync('ngx-electron-renderer-set-tray-context-menu', menu.items, timestamp);
    }

    setImage(image: NativeImage | string): void {
        this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setImage', image);
    }

    setTitle(title: string): void {
        this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setTitle', title);
    }

    setToolTip(toolTip: string): void {
        this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setToolTip', toolTip);
    }

    /***************************/
    addListener(event: any, listener: any): this {
        return this.on(event, listener);
    }

    displayBalloon(options: DisplayBalloonOptions): void {
        this.ipcRenderer.send('ngx-electron-tray-apply-method', 'displayBalloon', options);
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        return false;
    }

    eventNames(): Array<string | symbol> {
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'eventNames');
    }

    getBounds(): Rectangle {
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'getBounds');
    }

    getIgnoreDoubleClickEvents(): boolean {
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'getIgnoreDoubleClickEvents');
    }

    getMaxListeners(): number {
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'getMaxListeners');
    }

    getTitle(): string {
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'getTitle');
    }

    isDestroyed(): boolean {
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'isDestroyed');
    }

    listenerCount(type: string | symbol): number {
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'listenerCount', type);
    }

    listeners(event: string | symbol): [] {
        return this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'listeners', event);
    }

    popUpContextMenu(menu?: Menu, position?: Point): void {
    }

    prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
        return this;
    }

    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        return this;
    }

    removeAllListeners(event?: string | symbol): this {
        this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'removeAllListeners', event);
        return this;
    }

    removeListener(event: any, listener: any): this {
        return this;
    }

    setIgnoreDoubleClickEvents(ignore: boolean): void {
        this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setIgnoreDoubleClickEvents', ignore);
    }

    setMaxListeners(n: number): this {
        this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setMaxListeners', n);
        return this;
    }

    setPressedImage(image: NativeImage | string): void {
        this.ipcRenderer.sendSync('ngx-electron-tray-apply-method', 'setPressedImage', image);
    }

}
