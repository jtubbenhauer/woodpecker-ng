import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Set } from '../../../models/set';

@Component({
  selector: 'app-set-card',
  templateUrl: './set-card.component.html',
  styleUrls: ['./set-card.component.css'],
})
export class SetCardComponent implements OnInit, AfterViewInit {
  @Input() set!: Set;

  bestRadial?: string;
  currentRadial?: string;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.bestRadial = `--value:${this.set.best ? this.set.best * 100 : 0}`;
    this.currentRadial = `--value:${
      (this.set.completed / this.set.puzzleCount) * 100
    }`;
  }
}
