import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameReportService } from '../../../../core/infrastructure/api/game-report.service';
import { GameReportResponse, GameReportData } from '../../../../core/domain/interface/game-report-response';
import { GameLoadingService } from '../../../../core/infrastructure/services/game-loading.service';
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
  error: string | null = null;

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

  private async loadReport(): Promise<void> {
    if (!this.gameInstanceId) return;

    console.log('📊 [GameReport] Cargando reporte para:', this.gameInstanceId);
    
    try {
      const response = await this.gameLoadingService.loadGameData(
        () => this.gameReportService.getReport(this.gameInstanceId!).toPromise(),
        'content'
      ) as GameReportResponse;

      console.log('📊 [GameReport] Respuesta recibida:', response);

      if (!response || !response.data) {
        throw new Error('No se recibieron datos del reporte');
      }

      this.reportData = response.data;
      console.log('✅ [GameReport] Datos del reporte cargados:', this.reportData);
    } catch (error: any) {
      console.error('❌ [GameReport] Error cargando reporte:', error);
      
      // Manejo específico de errores HTTP
      if (error.status === 404) {
        this.error = 'No se encontró el reporte para esta programación';
      } else if (error.status === 403) {
        this.error = 'No tienes permisos para ver este reporte';
      } else if (error.status === 500) {
        this.error = 'Error interno del servidor';
      } else {
        this.error = 'Error al cargar el reporte del juego';
      }
      
      await this.alertService.showError(
        'Error al cargar reporte',
        this.error
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/juegos'], { 
      queryParams: { tab: 'misProgramaciones' } 
    });
  }

  getGameTypeIcon(gameType: string): string {
    switch (gameType.toLowerCase()) {
      case 'hangman':
      case 'ahorcado':
        return '🎯';
      case 'puzzle':
      case 'rompecabezas':
        return '🧩';
      case 'memory':
      case 'memoria':
        return '🧠';
      case 'solve the word':
      case 'pupiletras':
        return '🔤';
      default:
        return '🎮';
    }
  }

  getRatingStars(rating: string): string {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) {
      stars += '⭐'; // Puedes cambiar por ⭐️ si prefieres
    }
    
    return stars || '☆';
  }

  getAverageRating(): number {
    if (!this.reportData?.comments || this.reportData.comments.length === 0) {
      return 0;
    }

    const total = this.reportData.comments.reduce((sum, comment) => {
      return sum + parseFloat(comment.rating);
    }, 0);

    return Math.round((total / this.reportData.comments.length) * 10) / 10;
  }

  getCommentsCount(): number {
    return this.reportData?.comments?.length || 0;
  }

  getUserInitials(userName: string): string {
    return userName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  trackByComment(index: number, comment: any): string {
    return `${comment.user}_${comment.rating}_${index}`;
  }
}
