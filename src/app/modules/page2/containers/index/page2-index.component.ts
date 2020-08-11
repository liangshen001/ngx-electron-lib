import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {ElectronService} from '@ngx-electron/core';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-page2',
    templateUrl: './page2-index.component.html'
})
export class Page2IndexComponent implements OnInit {
    title = 'page2';

    data$: Observable<string>;

    constructor(private electronService: ElectronService) {}

    ngOnInit(): void {
        this.data$ = this.electronService.data<string>().pipe(
            map(({data}) => data)
        );
    }
}
