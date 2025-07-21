import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameReportService } from '../../../../core/infrastructure/api/game-report.service';
import { GameReportResponse, GameReportData, GamePlayer } from '../../../../core/domain/interface/game-report-response';
import { GameLoadingService } from '../../../../core/infrastructure/service/game-loading.service';
import { AlertService } from '../../../../core/infrastructure/service/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-report.component.html',
  styleUrl: './game-report.component.css'
})
export class GameReportComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameReportService = inject(GameReportService);
  private gameLoadingService = inject(GameLoadingService);
  private alertService = inject(AlertService);
  private subscription = new Subscription();

  gameInstanceId: string | null = null;
  reportData: GameReportData | null = null;
  totalPlayers: number = 0;
  error: string | null = null;
  // Paginación
  page: number = 1;
  limit: number = 6;
  offset: number = 0;
  isLoading: boolean = false;

  ngOnInit(): void {
    console.log('🚀 [GameReport] Componente inicializado');
    this.gameInstanceId = this.route.snapshot.paramMap.get('gameInstanceId');
    console.log('🔍 [GameReport] GameInstanceId obtenido:', this.gameInstanceId);
    
    if (this.gameInstanceId) {
      this.loadReport();
    } else {
      console.error('❌ [GameReport] ID de instancia de juego no válido');
      this.error = 'ID de instancia de juego no válido';
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.gameLoadingService.hideFast();
  }

  async loadReport(): Promise<void> {
    if (!this.gameInstanceId) return;
    this.isLoading = true;
    this.error = null;
    this.offset = (this.page - 1) * this.limit;
    try {
      const response = await this.gameLoadingService.loadGameData(
        () => this.gameReportService.getReport(this.gameInstanceId!, this.limit, this.offset).toPromise(),
        'content'
      ) as GameReportResponse;
      if (!response || !response.data) {
        throw new Error('No se recibieron datos del reporte');
      }
      this.reportData = response.data;
      this.totalPlayers = response.data.total_players || (response.data.players ? response.data.players.length : 0);
    } catch (error: any) {
      if (error.status === 404) {
        this.error = 'No se encontró el reporte para esta programación';
      } else if (error.status === 403) {
        this.error = 'No tienes permisos para ver este reporte';
      } else if (error.status === 500) {
        this.error = 'Error interno del servidor';
      } else {
        this.error = 'Error al cargar el reporte del juego';
      }
      await this.alertService.showError('Error al cargar reporte', this.error);
    } finally {
      this.isLoading = false;
    }
  }

  nextPage() {
    if (this.page * this.limit < this.totalPlayers) {
      this.page++;
      this.loadReport();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadReport();
    }
  }

  get showingFrom(): number {
    return this.offset + 1;
  }
  get showingTo(): number {
    return Math.min(this.offset + this.limit, this.totalPlayers);
  }

  goBack(): void {
    this.router.navigate(['/juegos'], { 
      queryParams: { tab: 'misProgramaciones' } 
    });
  }

  // Métodos antiguos de comentarios/rating eliminados porque ya no se usan con la nueva estructura
}
