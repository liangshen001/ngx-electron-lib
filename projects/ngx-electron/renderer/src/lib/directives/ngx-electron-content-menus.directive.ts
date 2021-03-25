import {Directive, ElementRef, EventEmitter, HostListener, Input, NgZone, OnInit, Output} from '@angular/core';
import {NgxElectronService} from '../ngx-electron.service';
import {MenuItemConstructorOptions, Menu, Event} from 'electron';

@Directive({
    selector: '[ngxElectronContextMenus]',
})
export class NgxElectronContentMenusDirective implements OnInit {

    @Input()
    set ngxElectronContextMenus(ngxElectronContextMenus: MenuItemConstructorOptions[]) {
        ngxElectronContextMenus.forEach(menuItem => {
            this.changes(menuItem);
        });
        this.menu = this.electronService.remote.Menu.buildFromTemplate(ngxElectronContextMenus);
        this.menu.on('menu-will-close', event => this.ngxElectronMenuWillClose.emit(event));
        this.menu.on('menu-will-show', event => this.ngxElectronMenuWillShow.emit(event));
        this.menu.once('menu-will-close', event => this.ngxElectronMenuWillCloseOnce.emit(event));
        this.menu.once('menu-will-show', event => this.ngxElectronMenuWillShowOnce.emit(event));
    }

    @Output()
    ngxElectronMenusClosed = new EventEmitter<void>();

    @Output()
    ngxElectronMenuWillClose = new EventEmitter<Event>();

    @Output()
    ngxElectronMenuWillShow = new EventEmitter<Event>();

    @Output('ngxElectronMenuWillClose.once')
    ngxElectronMenuWillCloseOnce = new EventEmitter<Event>();

    @Output('ngxElectronMenuWillShow.once')
    ngxElectronMenuWillShowOnce = new EventEmitter<Event>();

    @Input()
    ngxElectronMenusX: number;
    @Input()
    ngxElectronMenusY: number;
    @Input()
    ngxElectronPositioningItem: number;

    menu: Menu;

    constructor(private element: ElementRef,
                private electronService: NgxElectronService,
                private ngZone: NgZone) {
    }

    ngOnInit(): void {
    }

    @HostListener('contextmenu', ['$event'])
    contextmenu(event) {
        event.stopPropagation();
        this.menu.popup({
            window: this.electronService.remote.getCurrentWindow(),
            callback: () => this.ngxElectronMenusClosed.emit(),
            x: this.ngxElectronMenusX,
            y: this.ngxElectronMenusY,
            positioningItem: this.ngxElectronPositioningItem
        });
    }

    // click事件 让angular可以监听到
    changes(menuItem) {
        if (!menuItem) {
            return;
        }
        const click = menuItem.click;
        if (click) {
            menuItem.click = (...args) => this.ngZone.run(() => click(...args));
        }
        if (!menuItem.submenu) {
            return;
        }
        menuItem.submenu.forEach(subMenu => this.changes(subMenu));
    }

}
