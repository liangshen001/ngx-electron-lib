import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../../../../models/user';
import {select, State, Store} from '@ngrx/store';
import {addUser, deleteUser, updateUser} from '../../../../actions/user.action';
import {getAllUsers, UserReducerState} from '../../../../reducers/user.reducer';
import {ElectronStore} from '@ngx-electron/redux';
import {ElectronService} from '@ngx-electron/core';
import {AppState} from '../../../../reducers';

@Component({
    selector: 'app-user-table',
    templateUrl: './user-table.component.html'
})
export class UserTableComponent implements OnInit {
    users$: Observable<User[]>;
    updateMap = new Map<number, User>();
    name: string;
    sort: number;
    id: number;

    constructor(private electronStore: ElectronStore<UserReducerState>,
                private store$: Store<AppState>,
                private state: State<any>,
                private electronService: ElectronService) {
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

        const action = updateUser(this.updateMap.get(id));
        if (this.electronService.isElectron) {
            this.electronStore.dispatchToAllWindows(action);
        } else {
            this.electronStore.dispatch(action);
        }
        this.cancelUpdate(id);
    }

    addUser() {
        const action = addUser({
            name: this.name,
            sort: +this.sort,
            id: +this.id
        });
        if (this.electronService.isElectron) {
            this.electronStore.dispatchToAllWindows(action);
        } else {
            this.electronStore.dispatch(action);
        }
    }

    deleteUser(id: number) {
        const action = deleteUser({id});
        if (this.electronService.isElectron) {
            this.electronStore.dispatchToAllWindows(action);
        } else {
            this.electronStore.dispatch(action);
        }
    }
}
