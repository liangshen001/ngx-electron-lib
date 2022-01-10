import {Component, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {NgxElectronService} from '@ngx-electron/renderer';

@Component({
    selector: 'app-page3',
    templateUrl: './page3-index.component.html'
})
export class Page3IndexComponent implements OnInit {
    title = 'page3';


    data$: Observable<string>;

    constructor(private electronService: NgxElectronService) {}

    ngOnInit(): void {
        this.data$ = null/*this.electronService.data<string>().pipe(
            map(({data}) => data)
        );*/
    }
}
