import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChessService } from '../../services/chess.service';
import interact from 'interactjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit, AfterViewInit {
  @ViewChild('chessboard') el!: ElementRef<HTMLElement>;
  @ViewChild('chessDiv') chessDiv!: ElementRef<HTMLElement>;

  boardSize = '580px';
  length = 580;
  mouseDown?: number;
  mouseUp?: number;

  constructor(private service: ChessService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    console.log(this.el.nativeElement);
    interact(this.el.nativeElement).resizable({
      edges: {
        right: true,
        bottom: true,
      },
      listeners: {
        move: (event) => {
          let { x, y } = event.target.dataset;

          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;

          Object.assign(event.target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.width}px`,
            transform: `translate(${x}px, ${y}px)`,
          });

          Object.assign(event.target.dataset, { x, y });
        },
      },
    });
  }

  calcDimensions(length: number) {
    this.boardSize = `${length}px`;
  }

  onMouseDown(event: MouseEvent) {
    this.mouseDown = event.pageX;
  }

  onMouseMove(event: MouseEvent) {
    if (this.mouseDown) {
      this.length = this.length + (this.mouseDown - event.pageX);
    }
    this.calcDimensions(this.length);
  }

  onMouseUp(event: MouseEvent) {
    console.log(event.pageX);
    event.stopPropagation();
  }
}
