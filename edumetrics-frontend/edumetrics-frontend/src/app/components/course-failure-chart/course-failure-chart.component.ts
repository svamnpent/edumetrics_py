import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DesaprobadosPorCurso } from '../../models/analytics.models';

Chart.register(...registerables);

@Component({
  selector: 'app-course-failure-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="chart-header">
        <div>
          <h2 class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-4"></path>
            </svg>
            Tasa de Desaprobados por Asignatura
          </h2>
          <p class="card-subtitle">
            Detección de cuellos de botella académicos y promedios por curso
          </p>
        </div>
        <div class="summary-pill">
          Total asignaturas: <strong>{{ coursesData.length }}</strong>
        </div>
      </div>

      <div class="chart-wrapper">
        <canvas #barCanvas></canvas>
      </div>

      <div class="table-micro-summary">
        <div class="micro-row" *ngFor="let c of coursesData">
          <span class="course-name">{{ c.curso_nombre }}</span>
          <span class="badge" [ngClass]="c.tasa_reprobacion_pct > 30 ? 'badge-danger' : 'badge-primary'">
            {{ c.tasa_reprobacion_pct }}% reprobados ({{ c.total_desaprobados }}/{{ c.total_alumnos }})
          </span>
          <span class="course-avg">Prom: {{ c.promedio_curso | number:'1.1-1' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .summary-pill {
      font-size: 0.8rem;
      background: #f1f5f9;
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
    }

    .chart-wrapper {
      position: relative;
      height: 320px;
      width: 100%;
    }

    .table-micro-summary {
      margin-top: 1.25rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 0.75rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
    }

    .micro-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 0.6rem;
      background: #f8fafc;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
    }

    .course-name {
      font-weight: 600;
      color: var(--text-main);
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .course-avg {
      color: var(--text-muted);
      font-weight: 500;
    }
  `]
})
export class CourseFailureChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() coursesData: DesaprobadosPorCurso[] = [];
  @ViewChild('barCanvas') private barCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coursesData'] && this.barCanvas) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private renderChart(): void {
    if (!this.barCanvas || !this.coursesData.length) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.coursesData.map(c => c.curso_nombre);
    const dataValues = this.coursesData.map(c => c.tasa_reprobacion_pct);
    const backgroundColors = this.coursesData.map(c =>
      c.tasa_reprobacion_pct >= 35 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(37, 99, 235, 0.75)'
    );

    this.chart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '% Tasa de Desaprobados',
          data: dataValues,
          backgroundColor: backgroundColors,
          borderRadius: 6,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const item = this.coursesData[context.dataIndex];
                return [
                  `Reprobación: ${item.tasa_reprobacion_pct}%`,
                  `Desaprobados: ${item.total_desaprobados} de ${item.total_alumnos}`,
                  `Nota Promedio: ${item.promedio_curso}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Tasa de Reprobación (%)',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          },
          x: {
            ticks: {
              maxRotation: 25,
              minRotation: 0,
              font: { size: 11 }
            },
            grid: { display: false }
          }
        }
      }
    });
  }
}
