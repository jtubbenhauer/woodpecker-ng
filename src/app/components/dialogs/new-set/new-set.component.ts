import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';

@Component({
  selector: 'app-new-set',
  templateUrl: './new-set.component.html',
  styleUrls: ['./new-set.component.css'],
})
export class NewSetComponent implements OnInit {
  setRating = '1000';
  isValidRange = true;

  constructor(private userDataService: UserDataService) {}

  ngOnInit(): void {}

  changeRating(value: string) {
    this.setRating = value;
  }

  createSet() {
    this.userDataService.newSet(this.setRating);
  }
}
