import { TestBed } from '@angular/core/testing';

import { ReduxService } from './redux.service';

describe('ReduxService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReduxService = TestBed.get(ReduxService);
    expect(service).toBeTruthy();
  });
});
