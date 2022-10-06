import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SetService {

  private autoPlay$ = new BehaviorSubject(false);
  enableAutoPlay$ = this.autoPlay$.asObservable()

  constructor() { }

  toggleAutoPlay() {
    this.autoPlay$.next(!this.autoPlay$.value)
  }
}
