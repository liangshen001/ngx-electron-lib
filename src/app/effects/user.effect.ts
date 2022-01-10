import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {exhaustMap, map} from 'rxjs/operators';
import {loadUserList, loadUserListSuccess} from '../actions/user.action';
import {of} from 'rxjs';

@Injectable()
export class UserEffect {


    @Effect()
    loadUserList$ = this.actions$.pipe(
        ofType(loadUserList),
        exhaustMap(() => of([{
            id: 0,
            name: 'liangshen',
            sort: 1
        }, {
            id: 1,
            name: 'liangshen2',
            sort: 2
        }])),
        map(users => loadUserListSuccess({users}))
    );


    constructor(private actions$: Actions) {}
}
