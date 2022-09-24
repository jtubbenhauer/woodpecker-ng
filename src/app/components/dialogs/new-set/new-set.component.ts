import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';

@Component({
  selector: 'app-new-set',
  templateUrl: './new-set.component.html',
  styleUrls: ['./new-set.component.css'],
})
export class NewSetComponent implements OnInit {
  setRating = '1000';
  setSize = '100';

  constructor(private userDataService: UserDataService) {}

  ngOnInit(): void {}

  changeRating(value: string) {
    this.setRating = value;
  }

  changeSize(value: string) {
    this.setSize = value;
  }

  async createSet() {
    await this.userDataService.newSet(this.setRating, this.setSize);
  }
}
