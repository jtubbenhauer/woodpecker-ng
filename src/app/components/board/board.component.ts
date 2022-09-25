import {
  AfterViewInit,
  Component,
  ElementRef,
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
  boardWidth = '580px';
  boardHeight = '580px';

  constructor(private service: ChessService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {}

  handleWindowResize(event: UIEvent) {
    // console.log(event);
  }
}
