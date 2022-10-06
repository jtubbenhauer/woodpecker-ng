import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SetService {
  private autoPlay$ = new BehaviorSubject(false);
  enableAutoPlay$ = this.autoPlay$.asObservable();

  interval: any;
  puzzleTime$ = new BehaviorSubject(0);

  constructor() {}

  toggleAutoPlay() {
    this.autoPlay$.next(!this.autoPlay$.value);
  }

  //This will be private once getNextPuzzle is moved
  startTimer() {
    this.puzzleTime$.next(0);
    let start = Date.now();

    this.interval = setInterval(() => {
      let timeDiff = Date.now() - start;
      this.puzzleTime$.next(Math.floor(timeDiff / 1000));
    });
  }
}
