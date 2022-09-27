import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../../services/user-data.service';
import { puzzleThemes } from '../../../data/puzzleThemes';

@Component({
  selector: 'app-new-set',
  templateUrl: './new-set.component.html',
  styleUrls: ['./new-set.component.css'],
})
export class NewSetComponent implements OnInit {
  setRating = '1000';
  setSize = '100';
  themes = puzzleThemes;
  selectedThemes: string[] = [];
  numChecked = 0;

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

  onThemeSelection(event: any) {
    if (event.target.checked) {
      if (this.numChecked < 3) {
        this.selectedThemes?.push(event.target.value);
        this.numChecked++;
      } else {
        event.target.checked = false;
      }
    } else {
      this.selectedThemes = this.selectedThemes.filter((theme) => {
        return theme !== event.target.value;
      });
      this.numChecked--;
    }
    console.log(this.selectedThemes);
  }
}
