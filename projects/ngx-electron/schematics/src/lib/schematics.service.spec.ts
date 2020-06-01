import { TestBed } from '@angular/core/testing';

import { SchematicsService } from './schematics.service';

describe('SchematicsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SchematicsService = TestBed.get(SchematicsService);
    expect(service).toBeTruthy();
  });
});
