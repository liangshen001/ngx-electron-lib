import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../../../../models/user';
import {select, Store} from '@ngrx/store';
import {AddUser, DeleteUser, UpdateUser} from '../../../../actions/user.action';
import {getAllUsers, UserReducerState} from '../../../../reducers/user.reducer';
import {NgxElectronStoreService} from '@ngx-electron/store';

@Component({
    selector: 'app-user-table',
    templateUrl: './user-table.component.html'
})
export class UserTableComponent implements OnInit {
    users$: Observable<User[]>;
    updateMap = new Map<number, User>();
    name: string;
    sort: number;

    constructor(private store$: Store<UserReducerState>,
                private electronStoreService: NgxElectronStoreService) {
    }

    ngOnInit(): void {
        this.users$ = this.store$.pipe(
            select(getAllUsers)
        );
    }

    cancelUpdate(id: number) {
        this.updateMap.delete(id);
    }

    modify(user: User) {
        this.updateMap.set(user.id, {...user});
    }

    update(id: number) {
        this.electronStoreService.dispatch(new UpdateUser(this.updateMap.get(id)));
        this.cancelUpdate(id);
    }

    addUser() {
        this.electronStoreService.dispatch(new AddUser({
            name: this.name,
            sort: +this.sort
        }))
    }

    deleteUser(id: number) {
        this.electronStoreService.dispatch(new DeleteUser(id));
    }
}
