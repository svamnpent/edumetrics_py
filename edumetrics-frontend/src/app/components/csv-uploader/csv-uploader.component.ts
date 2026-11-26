import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { CsvUploadResponse, SeedResponse } from '../../models/analytics.models';

@Component({
  selector: 'app-csv-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card uploader-card">
      <div class="uploader-header">
        <div>
          <h2 class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Ingesta y Carga Masiva de Actas (.CSV)
          </h2>
          <p class="card-subtitle">
            Carga de archivos procesados y limpiados automáticamente por el pipeline de Pandas
          </p>
        </div>

        <button class="btn btn-secondary" (click)="triggerSeed()" [disabled]="isLoading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          {{ isLoading ? 'Procesando...' : 'Poblar Datos de Prueba (Seed)' }}
        </button>
      </div>

      <!-- Zona de Carga Drag & Drop -->
      <div
        class="drop-zone"
        [class.drag-over]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <input
          type="file"
          #fileInput
          accept=".csv"
          (change)="onFileSelected($event)"
          style="display: none;"
        />

        <div class="drop-content" (click)="fileInput.click()">
          <div class="upload-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <p class="drop-text">
            <strong>Haz clic para seleccionar</strong> o arrastra un archivo <code>.csv</code>
          </p>
          <span class="drop-hint">Formato requerido: estudiante_id, nombre, curso_id, curso, creditos, asistencia, notas...</span>
        </div>
      </div>

      <!-- Alertas de Estado -->
      <div *ngIf="uploadResult" class="alert-box alert-success animate-fade-in">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <div>
          <strong>¡Acta procesada exitosamente con Pandas!</strong>
          <p>
            Registros leídos: <strong>{{ uploadResult.registros_leidos }}</strong> |
            Válidos insertados: <strong>{{ uploadResult.registros_validos }}</strong> ({{ uploadResult.estudiantes_nuevos }} alumnos nuevos, {{ uploadResult.matriculas_nuevas }} notas registradas).
          </p>
        </div>
      </div>

      <div *ngIf="seedResult" class="alert-box alert-info animate-fade-in">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <div>
          <strong>Demostración Lista:</strong>
          <span>{{ seedResult.message || 'Se han generado ' + (seedResult.estudiantes_creados ?? 50) + ' estudiantes con correlaciones realistas.' }}</span>
        </div>
      </div>

      <div *ngIf="errorMessage" class="alert-box alert-danger animate-fade-in">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <div>
          <strong>Error de Carga:</strong>
          <span>{{ errorMessage }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .uploader-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .drop-zone {
      border: 2px dashed #cbd5e1;
      border-radius: var(--radius-lg);
      padding: 2rem 1.5rem;
      text-align: center;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .drop-zone:hover, .drop-zone.drag-over {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    .upload-icon {
      color: var(--primary);
      margin-bottom: 0.75rem;
    }

    .drop-text {
      font-size: 0.95rem;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }

    .drop-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .alert-box {
      margin-top: 1rem;
      padding: 0.85rem 1.2rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .alert-success {
      background: var(--success-bg);
      border: 1px solid #a7f3d0;
      color: #065f46;
    }

    .alert-info {
      background: var(--primary-light);
      border: 1px solid #bfdbfe;
      color: #1e40af;
    }

    .alert-danger {
      background: var(--danger-bg);
      border: 1px solid #fecaca;
      color: #991b1b;
    }
  `]
})
export class CsvUploaderComponent {
  private readonly analyticsService = inject(AnalyticsService);

  isDragging = false;
  isLoading = false;
  uploadResult: CsvUploadResponse | null = null;
  seedResult: SeedResponse | null = null;
  errorMessage = '';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files.length) {
      this.handleFile(event.target.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.name.endsWith('.csv')) {
      this.errorMessage = 'El archivo seleccionado debe tener extensión .csv';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.uploadResult = null;
    this.seedResult = null;

    this.analyticsService.uploadCsv(file).subscribe({
      next: (res) => {
        this.uploadResult = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Error al procesar el archivo CSV en el servidor.';
        this.isLoading = false;
      }
    });
  }

  triggerSeed(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.uploadResult = null;
    this.seedResult = null;

    this.analyticsService.seedData().subscribe({
      next: (res) => {
        this.seedResult = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al generar datos de prueba.';
        this.isLoading = false;
      }
    });
  }
}
