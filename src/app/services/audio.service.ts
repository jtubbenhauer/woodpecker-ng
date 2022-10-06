import {Injectable} from '@angular/core';
import {Howl} from "howler";

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  move = new Howl({
    src: ['../assets/move.mp3']
  });

  check = new Howl({
    src: ['../assets/check.mp3'],
  });

  capture = new Howl({
    src: ['../assets/capture.mp3'],
  });

  promotion = new Howl({
    src: ['../assets/promotion.mp3'],
  });

  constructor() {
  }
}
