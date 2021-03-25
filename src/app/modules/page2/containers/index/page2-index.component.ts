import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {NgxElectronService} from '@ngx-electron/renderer';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-page2',
    templateUrl: './page2-index.component.html'
})
export class Page2IndexComponent implements OnInit {
    title = 'page2';

    data$: Observable<string>;

    constructor(private electronService: NgxElectronService) {}

    ngOnInit(): void {
        this.data$ = this.electronService.data<string>().pipe(
            map(({data}) => data)
        );
    }
}
