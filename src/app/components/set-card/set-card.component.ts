import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Set } from '../../models/set';
import { RouterModule } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';

export interface SetWithId extends Set {
  id: string;
}

@Component({
  selector: 'app-set-card',
  templateUrl: './set-card.component.html',
  styleUrls: ['./set-card.component.css'],
})
export class SetCardComponent implements OnInit, AfterViewInit {
  @Input() set!: SetWithId;

  bestRadial?: string;
  currentRadial?: string;

  constructor(
    private router: RouterModule,
    private userDataService: UserDataService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.bestRadial = `--value:${this.set.best ? this.set.best * 100 : 0}`;
    this.currentRadial = `--value:${(
      (this.set.completed / this.set.attempts) *
      100
    ).toFixed(2)}`;
  }

  deleteSet() {
    this.userDataService.deleteSet(this.set.id);
  }
}
