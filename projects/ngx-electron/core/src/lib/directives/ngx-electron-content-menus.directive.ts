import {Directive, ElementRef, EventEmitter, HostListener, Input, NgZone, OnInit, Output} from '@angular/core';
import {ElectronService} from '../electron.service';
import {MenuItemConstructorOptions} from 'electron';

@Directive({
    selector: '[ngxElectronContextMenus]',
})
export class NgxElectronContentMenusDirective implements OnInit {

    @Input()
    ngxElectronContextMenus: MenuItemConstructorOptions[];

    @Output()
    ngxElectronMenusClosed = new EventEmitter();

    @Input()
    ngxElectronMenusX: number;
    @Input()
    ngxElectronMenusY: number;
    @Input()
    ngxElectronPositioningItem: number;

    constructor(private element: ElementRef,
                private electronService: ElectronService,
                private ngZone: NgZone) {
    }

    ngOnInit(): void {
        // this.element.nativeElement.setAttribute('tabindex', -1);
    }

    @HostListener('contextmenu', ['$event'])
    contextmenu(event) {
        event.stopPropagation();
        if (!this.ngxElectronContextMenus) {
            return;
        }
        const menu = new this.electronService.electron.remote.Menu();
        this.ngxElectronContextMenus.forEach(menuItem => {
            this.changes(menuItem);
            menu.append(new this.electronService.electron.MenuItem(menuItem));
        });
        menu.popup({
            window: this.electronService.electron.remote.getCurrentWindow(),
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
        menuItem.click = () => {
            this.ngZone.run(() => click());
        };
        if (!menuItem.submenu) {
            return;
        }
        menuItem.submenu.forEach(subMenu => this.changes(subMenu));
    }

}
