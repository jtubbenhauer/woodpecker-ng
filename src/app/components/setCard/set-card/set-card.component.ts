import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-set-card',
  templateUrl: './set-card.component.html',
  styleUrls: ['./set-card.component.css'],
})
export class SetCardComponent implements OnInit, AfterViewInit {
  data = {
    createdAt: new Date(),
    rating: '1000',
    puzzleCount: 100,
    timesCompleted: 3,
    currentPuzzleId: '001',
    completed: 50,
    best: 0.68,
  };

  bestRadial?: string;
  currentRadial?: string;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.bestRadial = `--value:${this.data.best * 100}`;
    this.currentRadial = `--value:${
      (this.data.completed / this.data.puzzleCount) * 100
    }`;
  }
}
