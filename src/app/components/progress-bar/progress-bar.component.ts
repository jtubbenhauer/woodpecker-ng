import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css'],
})
export class ProgressBarComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() completed!: number;
  @Input() puzzleCount!: number;
  barWidth = '';

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

  }

  ngOnChanges() {
    this.barWidth = (this.completed / this.puzzleCount) * 100 + '%';
  }
}
