import {Component, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {ElectronService} from '@ngx-electron/core';

@Component({
    selector: 'app-page3',
    templateUrl: './page3-index.component.html'
})
export class Page3IndexComponent implements OnInit {
    title = 'page3';


    data$: Observable<string>;

    constructor(private electronService: ElectronService) {}

    ngOnInit(): void {
        this.data$ = this.electronService.data<string>().pipe(
            map(({data}) => data)
        );
    }
}
