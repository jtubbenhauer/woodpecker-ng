import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SetService {
  autoPlay = new BehaviorSubject(false);
  enableAutoPlay$ = this.autoPlay.asObservable();

  interval: any;
  puzzleTime$ = new BehaviorSubject(0);

  constructor() {}

  toggleAutoPlay() {
    this.autoPlay.next(!this.autoPlay.value);
  }

  startTimer() {
    this.puzzleTime$.next(0);
    let start = Date.now();

    this.interval = setInterval(() => {
      let timeDiff = Date.now() - start;
      this.puzzleTime$.next(Math.floor(timeDiff / 1000));
    });
  }
}
