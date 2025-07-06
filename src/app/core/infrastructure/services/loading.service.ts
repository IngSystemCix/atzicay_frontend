import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message: string;
  showLogo: boolean;
  priority: number; // Nueva propiedad para manejar prioridades
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly _loadingState = new BehaviorSubject<LoadingState>({
    isLoading: false,
    message: 'Cargando...',
    showLogo: true,
    priority: 0
  });

  // Señal reactiva para el estado de carga
  public readonly loadingState = signal<LoadingState>({
    isLoading: false,
    message: 'Cargando...',
    showLogo: true,
    priority: 0
  });

  // Observable para compatibilidad con RxJS
  public readonly loadingState$ = this._loadingState.asObservable();

  // Stack para manejar múltiples loadings
  private loadingStack: LoadingState[] = [];

  /**
   * Muestra el indicador de carga global
   * @param message Mensaje personalizado a mostrar
   * @param showLogo Si debe mostrar el logo de Atzicay (por defecto true)
   * @param priority Prioridad del loading (mayor número = mayor prioridad)
   */
  show(message: string = 'Cargando...', showLogo: boolean = true, priority: number = 1): void {
    const newState: LoadingState = {
      isLoading: true,
      message,
      showLogo,
      priority
    };
    
    // Agregar al stack solo si no existe uno igual
    const existingIndex = this.loadingStack.findIndex(state => 
      state.message === message && state.priority === priority
    );
    
    if (existingIndex === -1) {
      this.loadingStack.push(newState);
    }
    
    // Mostrar inmediatamente si es alta prioridad (mayor a 5)
    if (priority > 5) {
      this.updateToHighestPriority();
    } else {
      // Para prioridades bajas, usar un pequeño delay
      setTimeout(() => {
        if (this.loadingStack.length > 0) {
          this.updateToHighestPriority();
        }
      }, 100);
    }
  }

  /**
   * Oculta el indicador de carga global
   * @param priority Si se especifica, solo oculta loadings de esta prioridad o menor
   */
  hide(priority?: number): void {
    if (priority !== undefined) {
      // Remover solo loadings de la prioridad especificada o menor
      this.loadingStack = this.loadingStack.filter(state => state.priority > priority);
    } else {
      // Remover el último loading agregado
      this.loadingStack.pop();
    }
    
    // Actualizar al loading de mayor prioridad o ocultar si no hay ninguno
    this.updateToHighestPriority();
  }

  /**
   * Fuerza el ocultado de todos los loadings
   */
  hideAll(): void {
    this.loadingStack = [];
    const newState: LoadingState = {
      isLoading: false,
      message: 'Cargando...',
      showLogo: true,
      priority: 0
    };
    
    this.loadingState.set(newState);
    this._loadingState.next(newState);
  }

  /**
   * Actualiza solo el mensaje sin cambiar el estado de carga
   * @param message Nuevo mensaje a mostrar
   */
  updateMessage(message: string): void {
    const currentState = this.loadingState();
    if (currentState.isLoading && this.loadingStack.length > 0) {
      // Actualizar el mensaje del loading actual (el último en el stack)
      const lastIndex = this.loadingStack.length - 1;
      this.loadingStack[lastIndex] = {
        ...this.loadingStack[lastIndex],
        message
      };
      
      const newState: LoadingState = {
        ...currentState,
        message
      };
      
      this.loadingState.set(newState);
      this._loadingState.next(newState);
    }
  }

  /**
   * Ejecuta una operación con indicador de carga automático
   * @param operation Función que retorna una Promise
   * @param message Mensaje a mostrar durante la carga
   * @param showLogo Si debe mostrar el logo (por defecto true)
   * @param priority Prioridad del loading
   */
  async withLoading<T>(
    operation: () => Promise<T>,
    message: string = 'Cargando...',
    showLogo: boolean = true,
    priority: number = 2
  ): Promise<T> {
    try {
      this.show(message, showLogo, priority);
      const result = await operation();
      return result;
    } finally {
      this.hide(priority);
    }
  }

  /**
   * Ejecuta una operación con indicador de carga automático para Observables
   * @param operation Función que retorna un Observable
   * @param message Mensaje a mostrar durante la carga
   * @param showLogo Si debe mostrar el logo (por defecto true)
   * @param priority Prioridad del loading
   */
  withLoadingObservable<T>(
    operation: () => Observable<T>,
    message: string = 'Cargando...',
    showLogo: boolean = true,
    priority: number = 2
  ): Observable<T> {
    return new Observable<T>(subscriber => {
      this.show(message, showLogo, priority);
      
      const subscription = operation().subscribe({
        next: (value) => subscriber.next(value),
        error: (error) => {
          this.hide(priority);
          subscriber.error(error);
        },
        complete: () => {
          this.hide(priority);
          subscriber.complete();
        }
      });

      return () => {
        this.hide(priority);
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Actualiza al loading de mayor prioridad
   */
  private updateToHighestPriority(): void {
    if (this.loadingStack.length === 0) {
      const newState: LoadingState = {
        isLoading: false,
        message: 'Cargando...',
        showLogo: true,
        priority: 0
      };
      
      this.loadingState.set(newState);
      this._loadingState.next(newState);
    } else {
      // Encontrar el loading de mayor prioridad
      const highestPriorityLoading = this.loadingStack.reduce((prev, current) => {
        return current.priority > prev.priority ? current : prev;
      });
      
      this.loadingState.set(highestPriorityLoading);
      this._loadingState.next(highestPriorityLoading);
    }
  }

  /**
   * Verifica si actualmente se está mostrando el loading
   */
  get isLoading(): boolean {
    return this.loadingState().isLoading;
  }

  /**
   * Obtiene el mensaje actual
   */
  get currentMessage(): string {
    return this.loadingState().message;
  }
}
