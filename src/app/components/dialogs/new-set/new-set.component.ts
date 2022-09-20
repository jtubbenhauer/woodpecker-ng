import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';

@Component({
  selector: 'app-new-set',
  templateUrl: './new-set.component.html',
  styleUrls: ['./new-set.component.css'],
})
export class NewSetComponent implements OnInit {
  minRating = '0';
  maxRating = '3000';
  isValidRange = true;

  constructor(private userDataService: UserDataService) {}

  ngOnInit(): void {}

  setMinRating(value: string) {
    this.minRating = value;
  }

  setMaxRating(value: string) {
    this.maxRating = value;
  }

  createSet() {
    if (this.minRating >= this.maxRating) {
      this.isValidRange = false;
      return;
    } else {
      this.isValidRange = true;
      this.userDataService.newSet();
    }
  }
}
