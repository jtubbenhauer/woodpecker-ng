import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css'],
})
export class ProgressBarComponent implements OnInit, AfterViewInit {
  @Input() completed!: number;
  @Input() puzzleCount!: number;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    console.log(this.completed, this.puzzleCount);
  }
}
