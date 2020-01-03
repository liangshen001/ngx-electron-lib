import {Directive, ElementRef, HostListener, Input, NgZone, OnInit} from '@angular/core';
import {NgxElectronService} from '../services/ngx-electron.service';
import {MenuItemConstructorOptions} from 'electron';

@Directive({
    selector: '[ngxElectronContextMenu]'
})
export class NgxElectronContentMenuDirective implements OnInit {

    @Input()
    menuItems: MenuItemConstructorOptions[];

    constructor(private element: ElementRef,
                private electronService: NgxElectronService,
                private ngZone: NgZone) {
    }

    ngOnInit(): void {
        // this.element.nativeElement.setAttribute('tabindex', -1);
    }

    @HostListener('contextmenu', ['$event'])
    contextmenu(event) {
        event.stopPropagation();
        if (!this.menuItems) {
            return;
        }
        const menu = new this.electronService.remote.Menu();
        this.menuItems.forEach(menuItem => {
            this.changes(menuItem);
            menu.append(new this.electronService.remote.MenuItem(menuItem));
        });
        menu.popup({window: this.electronService.remote.getCurrentWindow()});
    }

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
