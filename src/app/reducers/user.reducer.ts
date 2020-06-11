import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {User} from '../models/user';
import {addUser, deleteUser, loadUserListSuccess, updateUser} from '../actions/user.action';
import {createFeatureSelector, createReducer, createSelectorFactory, on} from '@ngrx/store';
import {AppState} from './index';
import {createSelectorsFactory} from '@ngrx/entity/src/state_selectors';


export interface UserReducerState extends EntityState<User> {
}

export const adapter: EntityAdapter<User> = createEntityAdapter<User>({
    selectId: user => user.id,
    sortComparer: (user1, user2) => user1.sort - user2.sort
});

const _userReducer = createReducer(
    adapter.getInitialState(),
    on(loadUserListSuccess, (state, action) => adapter.addAll(action.users, state)),
    on(deleteUser, (state, action) => {
        debugger;
        return adapter.removeOne(action.id, state);
    }),
    on(updateUser, (state, action) => adapter.updateOne({
        id: action.id,
        changes: {
            ...action
        }
    }, state)),
    on(addUser, (state, action) => adapter.addOne({
        ...action
    }, state))
);

export function userReducer(state, action): UserReducerState {
    debugger;
    return _userReducer(state, action);
}

export const getUserState = createFeatureSelector<AppState, UserReducerState>('user');

export const {
    selectIds: getUserIds,
    selectEntities: getUserEntities,
    selectAll: getAllUsers,
    selectTotal: getTotalUsers,
} = adapter.getSelectors(getUserState);

