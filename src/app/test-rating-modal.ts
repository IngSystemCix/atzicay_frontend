import { RatingModalService } from './core/infrastructure/service/rating-modal.service';

export async function testRatingModal() {
  const ratingModalService = new RatingModalService();
  
  console.log('Probando modal de valoración...');
  
  try {
    const result = await ratingModalService.showRatingModal(1, 1, 'Juego de Prueba');
    console.log('Resultado del modal:', result);
  } catch (error) {
    console.error('Error al mostrar modal:', error);
  }
}
