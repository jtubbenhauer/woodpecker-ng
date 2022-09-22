import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-new-set',
  templateUrl: './new-set.component.html',
  styleUrls: ['./new-set.component.css'],
})
export class NewSetComponent implements OnInit {
  setRating = '1000';
  isValidRange = true;

  constructor(
    private userDataService: UserDataService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {}

  changeRating(value: string) {
    this.setRating = value;
  }

  async createSet() {
    this.spinner.show();
    await this.userDataService.newSet(this.setRating);
    this.spinner.hide();
  }
}
