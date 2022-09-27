import { Component, Input, OnInit } from '@angular/core';
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
export class SetCardComponent implements OnInit {
  @Input() set!: SetWithId;

  constructor(
    private router: RouterModule,
    private userDataService: UserDataService
  ) {}

  ngOnInit(): void {}

  deleteSet() {
    this.userDataService.deleteSet(this.set.id);
  }
}
