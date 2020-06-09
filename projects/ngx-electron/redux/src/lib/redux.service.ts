import {Injectable, NgZone} from '@angular/core';
import {Action, Store} from '@ngrx/store';



@Injectable({
  providedIn: 'root'
})
export class ReduxService {

  constructor(private store$: Store<any>,
              private ngZone: NgZone) {
  }
}
