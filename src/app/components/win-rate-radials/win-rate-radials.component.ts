import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Set } from '../../models/set';

@Component({
  selector: 'app-win-rate-radials',
  templateUrl: './win-rate-radials.component.html',
  styleUrls: ['./win-rate-radials.component.css'],
})
export class WinRateRadialsComponent implements OnInit, AfterViewInit {
  @Input() setData!: Set;
  bestRadial?: string;
  currentRadial?: string;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.bestRadial = `--value:${
      this.setData.best ? this.setData.best * 100 : 0
    }`;
    this.currentRadial = `--value:${(
      (this.setData.completed / this.setData.attempts) *
      100
    ).toFixed(2)}`;
  }
}
