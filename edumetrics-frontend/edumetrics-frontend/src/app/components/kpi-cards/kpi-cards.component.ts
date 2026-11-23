import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPISummary } from '../../models/analytics.models';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-grid">
      <!-- KPI 1: Estudiantes -->
      <div class="kpi-card">
        <div class="kpi-icon icon-blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Estudiantes Evaluados</span>
          <h3 class="kpi-value">{{ kpis?.total_estudiantes ?? 0 }}</h3>
          <span class="kpi-hint">Matrículas activas en el periodo</span>
        </div>
      </div>

      <!-- KPI 2: Promedio General -->
      <div class="kpi-card">
        <div class="kpi-icon icon-indigo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20V10"></path>
            <path d="M18 20V4"></path>
            <path d="M6 20v-4"></path>
          </svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Promedio General</span>
          <h3 class="kpi-value">{{ (kpis?.promedio_general ?? 0) | number:'1.2-2' }} <span class="kpi-unit">/ 20</span></h3>
          <span class="kpi-hint">Escala vigesimal universitaria</span>
        </div>
      </div>

      <!-- KPI 3: Tasa de Aprobación -->
      <div class="kpi-card">
        <div class="kpi-icon" [ngClass]="(kpis?.tasa_aprobacion_global ?? 0) >= 60 ? 'icon-green' : 'icon-red'">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Tasa de Aprobación</span>
          <h3 class="kpi-value">{{ (kpis?.tasa_aprobacion_global ?? 0) | number:'1.1-1' }}%</h3>
          <span class="kpi-hint">Alumnos con nota ≥ 10.5</span>
        </div>
      </div>

      <!-- KPI 4: Correlación Asistencia vs Nota -->
      <div class="kpi-card">
        <div class="kpi-icon icon-purple">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">Correlación de Pearson</span>
          <h3 class="kpi-value">r = {{ (kpis?.correlacion_asistencia_nota ?? 0) | number:'1.3-3' }}</h3>
          <span class="kpi-hint" [ngClass]="getCorrelationClass(kpis?.correlacion_asistencia_nota ?? 0)">
            {{ getCorrelationLabel(kpis?.correlacion_asistencia_nota ?? 0) }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-blue { background: #eff6ff; color: #2563eb; }
    .icon-indigo { background: #e0e7ff; color: #4f46e5; }
    .icon-green { background: #ecfdf5; color: #10b981; }
    .icon-red { background: #fef2f2; color: #ef4444; }
    .icon-purple { background: #f5f3ff; color: #7c3aed; }

    .kpi-content {
      display: flex;
      flex-direction: column;
    }

    .kpi-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .kpi-value {
      font-size: 1.65rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0.2rem 0;
    }

    .kpi-unit {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 400;
    }

    .kpi-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .corr-strong { color: #10b981; font-weight: 600; }
    .corr-moderate { color: #2563eb; font-weight: 600; }
    .corr-weak { color: #f59e0b; font-weight: 600; }
  `]
})
export class KpiCardsComponent {
  @Input() kpis: KPISummary | null = null;

  getCorrelationLabel(r: number): string {
    if (r >= 0.7) return 'Correlación positiva alta';
    if (r >= 0.4) return 'Correlación positiva moderada';
    if (r > 0) return 'Correlación positiva baja';
    return 'Sin correlación';
  }

  getCorrelationClass(r: number): string {
    if (r >= 0.7) return 'corr-strong';
    if (r >= 0.4) return 'corr-moderate';
    return 'corr-weak';
  }
}
