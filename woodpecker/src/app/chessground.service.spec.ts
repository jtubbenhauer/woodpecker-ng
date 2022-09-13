import { TestBed } from '@angular/core/testing';

import { ChessgroundService } from './chessground.service';

describe('ChessgroundService', () => {
  let service: ChessgroundService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessgroundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
