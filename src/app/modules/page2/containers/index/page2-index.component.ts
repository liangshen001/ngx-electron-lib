import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {NgxElectronService} from '../../../../../../projects/ngx-electron/core/src/lib/services/ngx-electron.service';

@Component({
    selector: 'app-page2',
    templateUrl: './page2-index.component.html'
})
export class Page2IndexComponent implements OnInit {
    title = 'page2';

    initData: string;

    data$: Observable<string>;

    constructor(private electronService: NgxElectronService) {}

    ngOnInit(): void {
        this.initData = this.electronService.initData;

        this.data$ = this.electronService.data();
    }
}
