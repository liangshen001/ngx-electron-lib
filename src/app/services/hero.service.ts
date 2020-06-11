import { Injectable } from '@angular/core';
import {
    EntityCollectionServiceBase,
    EntityCollectionServiceElementsFactory
} from '@ngrx/data';

@Injectable({ providedIn: 'root' })
export class HeroService extends EntityCollectionServiceBase<Hero> {
    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Hero', serviceElementsFactory);
    }
}

export class Hero {
    name: string;
    id: number;
}
