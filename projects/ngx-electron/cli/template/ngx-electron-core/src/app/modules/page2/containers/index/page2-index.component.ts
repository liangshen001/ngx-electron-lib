import {Component, OnInit} from '@angular/core';
import {ElectronService} from '@ngx-electron/core';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-page2',
    templateUrl: './page2-index.component.html'
})
export class Page2IndexComponent implements OnInit {
    title = 'page2';

    initData: string;

    data$: Observable<string>;

    constructor(private electronService: ElectronService) {}

    ngOnInit(): void {
        this.initData = this.electronService.initData;

        this.data$ = this.electronService.data();
    }
}
