import { Input, Output, EventEmitter, Directive } from '@angular/core';
import { CreateGame } from '../../../domain/model/create-game.model';

@Directive()
export abstract class BaseCreateGameComponent {
  @Input() userId!: number;
  @Output() gameCreated = new EventEmitter<any>();
  @Output() creationError = new EventEmitter<any>();

  abstract buildGameData(): CreateGame;

  onCreateGame(createGameService: any, gameType: string) {
    const data = this.buildGameData();
    createGameService.createGame(this.userId, gameType, data).subscribe({
      next: (res: any) => this.gameCreated.emit(res),
      error: (err: any) => this.creationError.emit(err)
    });
  }
}
