import { Component, Input, OnInit } from '@angular/core';
import { Set } from '../../models/set';

@Component({
  selector: 'app-set-stats',
  templateUrl: './set-stats.component.html',
  styleUrls: ['./set-stats.component.css'],
})
export class SetStatsComponent implements OnInit {
  @Input() setData!: Set;

  constructor() {}

  ngOnInit(): void {}
}
