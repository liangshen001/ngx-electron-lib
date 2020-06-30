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

    destroy(): void {
        this.ipcRenderer.send('ngx-electron-tray-apply-method', 'destroy');
    }

    on(event: any, listener: any): this {
        const timestamp = new Date().getTime();
        this.ipcRenderer.on(`ngx-electron-tray-on-${event}-${timestamp}`, listener);
        this.ipcRenderer.send(`ngx-electron-tray-on-event`, event, timestamp);
        return this;
    }

    once(event, listener): this {
        const timestamp = new Date().getTime();
        this.ipcRenderer.on(`ngx-electron-tray-once-${event}-${timestamp}`, listener);
        this.ipcRenderer.send(`ngx-electron-tray-once-event`, event, timestamp);
        return this;
    }

    setContextMenu(menu: Menu | null): void {
        const timestamp = new Date().getTime();
        this.ipcRenderer.on(`ngx-electron-click-tray-context-menu-item-${timestamp}`, (event, i) => {
            const item = menu.items.find((value, index) => index === i);
            this.ngZone.run(() => setTimeout(() =>
                item.click && item.click(null, null, null)));
        });
        this.ipcRenderer.send('ngx-electron-renderer-set-tray-context-menu', menu.items, timestamp);
    }

    setImage(image: NativeImage | string): void {
        this.ipcRenderer.send('ngx-electron-tray-apply-method', 'setImage', image);
    }

    setTitle(title: string): void {
        this.ipcRenderer.send('ngx-electron-tray-apply-method', 'setTitle', title);
    }

    setToolTip(toolTip: string): void {
        this.ipcRenderer.send('ngx-electron-tray-apply-method', 'setToolTip', toolTip);
    }

    /***************************/
    addListener(event: any, listener: any): this {
        const timestamp = new Date().getTime();
        this.ipcRenderer.on(`ngx-electron-tray-on-${event}-${timestamp}`, listener);
        this.ipcRenderer.send(`ngx-electron-tray-on-event`, event, timestamp);
        return this;
    }

    displayBalloon(options: DisplayBalloonOptions): void {
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        return false;
    }

    eventNames(): Array<string | symbol> {
        return undefined;
    }

    getBounds(): Rectangle {
        return undefined;
    }

    getIgnoreDoubleClickEvents(): boolean {
        return false;
    }

    getMaxListeners(): number {
        return 0;
    }

    getTitle(): string {
        return '';
    }

    isDestroyed(): boolean {
        return false;
    }

    listenerCount(type: string | symbol): number {
        return 0;
    }

    listeners(event: string | symbol): [] {
        return [];
    }

    popUpContextMenu(menu?: Menu, position?: Point): void {
    }

    prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
        return undefined;
    }

    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        return undefined;
    }

    removeAllListeners(event?: string | symbol): this {
        return undefined;
    }

    removeListener(event: any, listener: any): this {
        return undefined;
    }

    setIgnoreDoubleClickEvents(ignore: boolean): void {
    }

    setMaxListeners(n: number): this {
        return undefined;
    }

    setPressedImage(image: NativeImage | string): void {
    }

}
