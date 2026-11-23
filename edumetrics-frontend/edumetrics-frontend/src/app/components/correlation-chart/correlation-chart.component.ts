import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { CorrelacionResponse } from '../../models/analytics.models';

Chart.register(...registerables);

@Component({
  selector: 'app-correlation-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="chart-header">
        <div>
          <h2 class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Correlación: Asistencia vs. Calificación Final
          </h2>
          <p class="card-subtitle">
            Cálculo matricial con NumPy (Coeficiente de Pearson: 
            <strong>r = {{ correlationData?.coeficiente_pearson | number:'1.4-4' }}</strong>)
          </p>
        </div>
        <div class="badge-interpretation" [ngClass]="getBadgeClass()">
          {{ correlationData?.interpretacion }}
        </div>
      </div>

      <div class="chart-wrapper">
        <canvas #chartCanvas></canvas>
      </div>

      <div class="chart-footer">
        <div class="legend-item">
          <span class="dot dot-points"></span> Puntos de Rendimiento (Estudiante - Curso)
        </div>
        <div class="legend-item">
          <span class="line line-trend"></span> Línea de Tendencia (Regresión Lineal)
        </div>
        <div class="formula-badge">
          y = {{ correlationData?.linea_tendencia?.slope }}x + {{ correlationData?.linea_tendencia?.intercept }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .badge-interpretation {
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      font-weight: 600;
      max-width: 420px;
      line-height: 1.3;
    }

    .badge-strong { background: var(--success-bg); color: #065f46; border: 1px solid #a7f3d0; }
    .badge-moderate { background: var(--primary-light); color: #1e40af; border: 1px solid #bfdbfe; }
    .badge-weak { background: var(--warning-bg); color: #92400e; border: 1px solid #fde68a; }

    .chart-wrapper {
      position: relative;
      height: 380px;
      width: 100%;
    }

    .chart-footer {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
      flex-wrap: wrap;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dot-points {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #2563eb;
    }

    .line-trend {
      width: 20px;
      height: 3px;
      background: #ef4444;
      display: inline-block;
    }

    .formula-badge {
      margin-left: auto;
      font-family: monospace;
      background: #f1f5f9;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      color: #334155;
    }
  `]
})
export class CorrelationChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() correlationData: CorrelacionResponse | null = null;
  @ViewChild('chartCanvas') private chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['correlationData'] && this.chartCanvas) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  getBadgeClass(): string {
    const r = this.correlationData?.coeficiente_pearson ?? 0;
    if (r >= 0.7) return 'badge-strong';
    if (r >= 0.4) return 'badge-moderate';
    return 'badge-weak';
  }

  private renderChart(): void {
    if (!this.chartCanvas || !this.correlationData) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const puntos = this.correlationData.puntos.map(p => ({
      x: p.asistencia,
      y: p.nota_final,
      meta: p
    }));

    // Puntos de la recta de regresión (x=0 a x=100)
    const slope = this.correlationData.linea_tendencia.slope;
    const intercept = this.correlationData.linea_tendencia.intercept;

    const xMin = 20;
    const xMax = 100;
    const trendlinePoints = [
      { x: xMin, y: Math.min(20, Math.max(0, slope * xMin + intercept)) },
      { x: xMax, y: Math.min(20, Math.max(0, slope * xMax + intercept)) }
    ];

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'scatter',
      data: {
        datasets: [
          {
            type: 'scatter',
            label: 'Estudiantes',
            data: puntos,
            backgroundColor: 'rgba(37, 99, 235, 0.65)',
            borderColor: '#2563eb',
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 8
          },
          {
            type: 'line',
            label: 'Tendencia Lineal (NumPy)',
            data: trendlinePoints,
            borderColor: '#ef4444',
            borderWidth: 2.5,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                if (context.datasetIndex === 0) {
                  const raw = context.raw;
                  return [
                    `Alumno: ${raw.meta.estudiante_nombre} (${raw.meta.estudiante_id})`,
                    `Curso: ${raw.meta.curso_nombre}`,
                    `Asistencia: ${raw.x}%`,
                    `Nota Final: ${raw.y} / 20`
                  ];
                }
                return `Regresión: y = ${slope}x + ${intercept}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Porcentaje de Asistencia (%)',
              font: { weight: 'bold' }
            },
            min: 0,
            max: 105,
            grid: { color: '#f1f5f9' }
          },
          y: {
            title: {
              display: true,
              text: 'Nota Final (0 a 20)',
              font: { weight: 'bold' }
            },
            min: 0,
            max: 20.5,
            grid: { color: '#f1f5f9' }
          }
        }
      }
    });
  }
}
