import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Set } from '../../models/set';

@Component({
  selector: 'app-win-rate-radials',
  templateUrl: './win-rate-radials.component.html',
  styleUrls: ['./win-rate-radials.component.css'],
})
export class WinRateRadialsComponent implements OnInit, OnChanges {
  @Input() setData!: Set;
  bestRadial?: string;
  currentRadial?: string;
  current!: string;
  best!: string;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges() {
    if (this.setData.attempts && this.setData.completed) {
      this.current = (
        (this.setData.completed / this.setData.attempts) *
        100
      ).toFixed(0);
    } else {
      this.current = '0';
    }

    this.best = this.setData.best ? (this.setData.best * 100).toFixed(0) : '0';

    this.bestRadial = `--value:${this.best}`;
    this.currentRadial = `--value:${this.current}`;
  }
}
