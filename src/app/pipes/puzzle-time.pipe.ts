import { Pipe, PipeTransform } from '@angular/core';
import { PuzzleTimeFormat } from '../models/PuzzleTimeFormat';

@Pipe({
  name: 'puzzleTime',
})
export class PuzzleTimePipe implements PipeTransform {
  transform(time: number | null): string {
    if (time) {
      let hours = Math.floor(time / 3600);
      let minutes = Math.floor((time % 3600) / 60);
      let seconds = time % 60;
      let minuteString =
        minutes.toString().length == 1
          ? `0${minutes.toString()}`
          : minutes.toString();
      let secondString =
        seconds.toString().length == 1
          ? `0${seconds.toString()}`
          : seconds.toString();
      return `${hours.toFixed()}:${minuteString}:${secondString}`;
    } else {
      return '0:00:00';
    }
  }
}
