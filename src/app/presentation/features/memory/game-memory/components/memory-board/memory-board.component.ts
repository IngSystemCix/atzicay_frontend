import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MemoryCardComponent } from '../memory-card/memory-card.component';
import { CommonModule } from '@angular/common';

interface Card {
  id: number;
  image: string;
  name: string;
  flipped: boolean;
  matched: boolean;
  isImageCard?: boolean; // Para distinguir entre imagen y texto
  text?: string; // Para modo imagen-descripción
}
@Component({
  selector: 'app-memory-board',
  standalone: true,
  templateUrl: './memory-board.component.html',
  styleUrls: ['./memory-board.component.css'],
  imports: [MemoryCardComponent, CommonModule]
})
export class MemoryBoardComponent {
  @Input() cards: Card[] = [];
  @Input() gridClass = 'grid-cols-4';
  @Output() cardFlipped = new EventEmitter<Card>();

  onCardClick(card: Card) {
    this.cardFlipped.emit(card);
  }
}