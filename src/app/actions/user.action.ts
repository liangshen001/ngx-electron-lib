import {createAction, props} from '@ngrx/store';
import {User} from '../models/user';

export const addUser = createAction('[user] add user', props<User>());
export const updateUser = createAction('[user] updateUser', props<User>());
export const deleteUser = createAction('[user] deleteUser', props<{
    id: number
}>());
export const loadUserList = createAction('[user] loadUserList');
export const loadUserListSuccess = createAction('[user] loadUserListSuccess', props<{
    users: User[]
}>());
