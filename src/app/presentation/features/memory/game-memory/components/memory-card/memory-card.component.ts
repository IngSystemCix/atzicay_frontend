import { Component, Input, Output, EventEmitter } from '@angular/core';

interface Card {
  id: number;
  image: string;
  name: string;
  flipped: boolean;
  matched: boolean;
  isImageCard?: boolean;
  text?: string;
}

@Component({
  selector: 'app-memory-card',
  templateUrl: './memory-card.component.html',
  styleUrls: ['./memory-card.component.css']
})
export class MemoryCardComponent {
  @Input() card!: Card;
  @Output() cardClicked = new EventEmitter<Card>();

  onCardClick() {
    this.cardClicked.emit(this.card);
  }
}