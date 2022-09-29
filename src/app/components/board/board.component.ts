import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import interact from 'interactjs';
import { Subscription } from 'rxjs';
import { ChessService } from '../../services/chess.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent
  implements OnInit, AfterViewInit, OnDestroy, AfterContentChecked
{
  @ViewChild('chessboard') el!: ElementRef<HTMLElement>;
  @ViewChildren('chessboard') elChildren!: QueryList<HTMLElement>;
  colorSub?: Subscription;
  currentColor?: string;
  boardLoaded = false;

  constructor(private chessService: ChessService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
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

    this.colorSub = this.chessService.currentColour$.subscribe((next) => {
      this.currentColor = next;
      if (this.el.nativeElement.children[0]) {
        this.setBorders();
      }
    });
  }

  ngOnDestroy() {
    this.colorSub?.unsubscribe();
  }

  ngAfterContentChecked() {
    if (!this.boardLoaded) {
      if (this.el) {
        if (this.el.nativeElement.children.length) {
          this.boardLoaded = true;
          this.setBorders();
        }
      }
    }
  }

  setBorders() {
    if (this.currentColor == 'white') {
      //@ts-ignore
      this.el.nativeElement.children[0].attributes.item(0).value =
        'border: 15px solid #F1F1F1; border-radius: 10px; transition: border-color 500ms';
      this.el.nativeElement.children[0].children[4].classList.remove('light');
      this.el.nativeElement.children[0].children[5].classList.remove('light');
      this.el.nativeElement.children[0].children[4].classList.add('dark');
      this.el.nativeElement.children[0].children[5].classList.add('dark');
    } else {
      //@ts-ignore
      this.el.nativeElement.children[0].attributes.item(0).value =
        'border: 15px solid #222222; border-radius: 10px; transition: border-color 500ms';
      this.el.nativeElement.children[0].children[4].classList.remove('dark');
      this.el.nativeElement.children[0].children[5].classList.remove('dark');
      this.el.nativeElement.children[0].children[4].classList.add('light');
      this.el.nativeElement.children[0].children[5].classList.add('light');
    }
  }

  onWindowResize(window: any) {
    if (window.innerWidth <= 840) {
      Object.assign(this.el.nativeElement.style, {
        width: `${window.innerWidth - 50}px`,
        height: `${window.innerWidth - 50}px`,
      });
    }
  }
}
