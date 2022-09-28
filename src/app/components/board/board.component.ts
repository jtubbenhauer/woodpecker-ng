import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {ChessService} from '../../services/chess.service';
import interact from 'interactjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit, AfterViewInit {
  @ViewChild('chessboard') el!: ElementRef<HTMLElement>;
  @ViewChild('chessDiv') chessDiv!: ElementRef<HTMLElement>;

  constructor(private service: ChessService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    interact(this.el.nativeElement).resizable({
      edges: {
        right: true,
        bottom: true,
      },
      listeners: {
        move: (event) => {
          let {x, y} = event.target.dataset;

          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;

          Object.assign(event.target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.width}px`,
            transform: `translate(${x}px, ${y}px)`,
          });

          Object.assign(event.target.dataset, {x, y});
        },
      },
    });
  }

}
