import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {NgxElectronService} from '../../services/ngx-electron.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
    selector: 'ngx-electron-window',
    templateUrl: 'ngx-electron-window.component.html',
    styleUrls: ['ngx-electron-window.component.scss']
})
export class NgxElectronWindowComponent implements OnInit {

    @Input()
    showCloseBtn = false;
    @Input()
    showMiniBtn = false;
    @Input()
    showSettingBtn = false;
    @Input()
    closeBtnTitle = 'close';
    @Input()
    miniBtnTitle = 'mini';
    @Input()
    settingBtnTitle = 'setting';
    @Input()
    set background(value: string) {
        this.backgroundSafeStyle = this.sanitizer.bypassSecurityTrustStyle(value);
    }
    @Output()
    setting = new EventEmitter<any>();
    @Input()
    btnTemp: TemplateRef<any>;
    @Input()
    titleTemp: TemplateRef<any>;

    backgroundSafeStyle: SafeStyle;

    @Input()
    style = {
        'display': 'flex',
        'flex-direction': 'column'
    };

    // options: WindowOptions = {
    //     controlBtns: {
    //         close: {
    //             show: true,
    //             title: 'close'
    //         },
    //         mini: {
    //             show: true,
    //             title: 'mini'
    //         },
    //         setting: {
    //             show: false,
    //             title: 'setting',
    //             apply: () => {}
    //         }
    //     },
    //     background: 'transparent'
    // };

    isElectron: boolean;

    isMac: boolean;

    constructor(private electronService: NgxElectronService,
                private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        this.isElectron = this.electronService.isElectron();
        this.isMac = this.electronService.isMac();
    }

    close(): void {
        this.electronService.remote.getCurrentWindow().close();
    }

    minimize(): void {
        this.electronService.remote.getCurrentWindow().minimize();
    }
}
