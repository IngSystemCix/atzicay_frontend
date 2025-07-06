# Sistema Global de Loading - Atzicay

Este sistema proporciona un indicador de carga global reutilizable para toda la aplicación Atzicay, con el diseño y colores de la marca.

## Componentes

### 1. LoadingService
Servicio singleton que controla el estado global del loading.

### 2. GlobalLoadingComponent  
Componente visual que muestra el indicador de carga con animaciones y el logo de Atzicay.

### 3. loadingInterceptor
Interceptor HTTP que muestra automáticamente el loading durante las peticiones.

## Instalación

Los componentes ya están configurados en `app.config.ts` y `app.component.html`. 

## Uso del LoadingService

### Importar el servicio
```typescript
import { LoadingService } from './core/infrastructure/services/loading.service';
```

### Inyectar en el componente
```typescript
export class MiComponente {
  private readonly loadingService = inject(LoadingService);
}
```

### Métodos principales

#### 1. Mostrar loading básico
```typescript
// Mostrar con mensaje por defecto
this.loadingService.show();

// Mostrar con mensaje personalizado
this.loadingService.show('Cargando juego...');

// Mostrar sin logo de Atzicay
this.loadingService.show('Procesando...', false);
```

#### 2. Ocultar loading
```typescript
this.loadingService.hide();
```

#### 3. Actualizar mensaje durante la carga
```typescript
this.loadingService.updateMessage('Guardando partida...');
```

#### 4. Ejecutar operación con loading automático (Promises)
```typescript
// Con Promise
const resultado = await this.loadingService.withLoading(
  () => this.miServicio.operacionLenta(),
  'Procesando datos...'
);

// Sin logo
const resultado = await this.loadingService.withLoading(
  () => this.miServicio.operacionLenta(),
  'Procesando...',
  false
);
```

#### 5. Ejecutar operación con loading automático (Observables)
```typescript
this.loadingService.withLoadingObservable(
  () => this.miServicio.obtenerDatos(),
  'Cargando datos...'
).subscribe(datos => {
  // Manejar datos
  // El loading se oculta automáticamente
});
```

#### 6. Verificar estado actual
```typescript
if (this.loadingService.isLoading) {
  console.log('Actualmente cargando:', this.loadingService.currentMessage);
}
```

## Ejemplos de uso común

### 1. En operaciones de carga de juegos
```typescript
async cargarJuego() {
  try {
    const juego = await this.loadingService.withLoading(
      () => this.juegoService.obtenerJuego(this.juegoId),
      'Cargando juego...'
    );
    this.configurarJuego(juego);
  } catch (error) {
    // Manejar error - el loading se oculta automáticamente
  }
}
```

### 2. En operaciones con múltiples pasos
```typescript
async procesarPartida() {
  this.loadingService.show('Iniciando procesamiento...');
  
  try {
    this.loadingService.updateMessage('Validando datos...');
    await this.validarDatos();
    
    this.loadingService.updateMessage('Guardando partida...');
    await this.guardarPartida();
    
    this.loadingService.updateMessage('Actualizando estadísticas...');
    await this.actualizarEstadisticas();
    
  } finally {
    this.loadingService.hide();
  }
}
```

### 3. Con signals (reactividad)
```typescript
export class MiComponente {
  private readonly loadingService = inject(LoadingService);
  
  // Signal reactivo del estado de loading
  protected readonly loadingState = computed(() => this.loadingService.loadingState());
  
  // En el template puedes usar
  // @if (loadingState().isLoading) { ... }
}
```

### 4. Desactivar interceptor para peticiones específicas
```typescript
// Si quieres que una petición HTTP no muestre el loading automático
const headers = new HttpHeaders().set('X-Skip-Loading', 'true');
this.http.get('/api/endpoint', { headers }).subscribe(...);
```

## Características del componente visual

- **Logo animado de Atzicay**: Rotación suave y efectos de brillo
- **Spinner doble**: Dos anillos girando en direcciones opuestas
- **Animaciones fluidas**: Entrada, salida y transiciones suaves
- **Partículas decorativas**: Elementos flotantes de fondo
- **Barra de progreso**: Animación continua decorativa
- **Puntos animados**: Indicador de actividad con rebote secuencial
- **Backdrop blur**: Efecto de desenfoque del fondo
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## Personalización

### Colores
El componente usa las variables CSS de Atzicay definidas en `styles.css`:
- `--color-atzicay-purple-500`
- `--color-atzicay-bg`
- `--color-atzicay-border`

### Mensajes comunes sugeridos
```typescript
// Para juegos
'Cargando juego...'
'Iniciando partida...'
'Guardando progreso...'
'Verificando respuesta...'

// Para datos
'Cargando datos...'
'Sincronizando...'
'Procesando información...'

// Para autenticación
'Verificando usuario...'
'Iniciando sesión...'
'Cerrando sesión...'
```

## Interceptor HTTP automático

El interceptor `loadingInterceptor` se ejecuta automáticamente en todas las peticiones HTTP y:
- Muestra el loading cuando hay peticiones activas
- Cuenta las peticiones concurrentes
- Oculta el loading cuando todas las peticiones terminan
- Maneja errores automáticamente

## Buenas prácticas

1. **Usa mensajes descriptivos**: Ayuda al usuario a entender qué está pasando
2. **Operaciones largas**: Para operaciones que toman más de 2 segundos, considera actualizar el mensaje
3. **Errores**: Siempre oculta el loading en bloques finally o catch
4. **Concurrencia**: El servicio maneja múltiples llamadas simultáneas correctamente
5. **Testing**: Mock el LoadingService en tests para evitar efectos secundarios

## Troubleshooting

### El loading no se muestra
- Verifica que `GlobalLoadingComponent` esté importado en `app.component.ts`
- Confirma que el componente esté en el template de `app.component.html`

### El loading no se oculta
- Asegúrate de llamar `hide()` en bloques finally
- Verifica que no haya excepciones que interrumpan el flujo

### Conflictos con otros loaders
- Este sistema está diseñado para reemplazar otros indicadores de carga
- Usa `showLogo: false` si necesitas un loader más minimalista
