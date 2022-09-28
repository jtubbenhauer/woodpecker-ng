import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Set } from '../../models/set';
import { getCurrentWinrate } from '../../utils/utils';

@Component({
  selector: 'app-win-rate-radials',
  templateUrl: './win-rate-radials.component.html',
  styleUrls: ['./win-rate-radials.component.css'],
})
export class WinRateRadialsComponent implements OnInit, OnChanges {
  @Input() setData!: Set;
  bestRadial?: any;
  currentRadial?: any;
  current!: string;
  best!: string;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges() {
    this.current = getCurrentWinrate(this.setData);

    this.best = this.setData.best ? (this.setData.best * 100).toFixed(0) : '0';

    // this.bestRadial = `--value:${this.best}`;
    this.bestRadial = { '--value': this.best, '--thickness': '5px' };

    this.currentRadial = { '--value': this.current, '--thickness': '5px' };
  }
}
