import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChessService } from '../../services/chess.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit, AfterViewInit {
  @ViewChild('chessboard') el!: ElementRef<HTMLElement>;
  boardSize = '580px';
  length = 580;
  mouseDown?: number;
  mouseUp?: number;

  constructor(private service: ChessService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    // this.calcDimensions(this.length);
  }

  calcDimensions(length: number) {
    this.boardSize = `${length}px`;
  }

  onMouseDown(event: MouseEvent) {
    this.mouseDown = event.pageX;
  }

  onMouseMove(event: MouseEvent) {
    if (this.mouseDown) {
      this.length = this.length - (event.pageX - this.mouseDown);
    }
    this.calcDimensions(this.length);
  }

  onMouseUp(event: MouseEvent) {
    console.log(event.pageX);
    event.stopPropagation();
  }
}
