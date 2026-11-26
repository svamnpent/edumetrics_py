import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskStudentItem } from '../../models/analytics.models';

@Component({
  selector: 'app-risk-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="risk-header">
        <div>
          <h2 class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Sistema de Alerta Temprana (Alumnos en Riesgo)
          </h2>
          <p class="card-subtitle">
            Detección de estudiantes vulnerables por inasistencia crítica o calificaciones atípicas (Z-Score)
          </p>
        </div>

        <div class="stats-pills">
          <span class="pill-count count-danger">
            {{ countAltoRiesgo }} Alto Riesgo
          </span>
          <span class="pill-count count-warning">
            {{ countRiesgoMedio }} Riesgo Medio
          </span>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="filter-bar">
        <input
          type="text"
          class="search-input"
          placeholder="Filtrar por estudiante o curso..."
          [(ngModel)]="searchQuery"
          (ngModelChange)="filterData()"
        />

        <div class="filter-toggle">
          <button
            class="toggle-btn"
            [class.active]="selectedLevel === 'TODOS'"
            (click)="setLevel('TODOS')"
          >
            Todos ({{ riskStudents.length }})
          </button>
          <button
            class="toggle-btn"
            [class.active]="selectedLevel === 'ALTO RIESGO'"
            (click)="setLevel('ALTO RIESGO')"
          >
            Solo Alto Riesgo
          </button>
          <button
            class="toggle-btn"
            [class.active]="selectedLevel === 'RIESGO MEDIO'"
            (click)="setLevel('RIESGO MEDIO')"
          >
            Solo Riesgo Medio
          </button>
        </div>
      </div>

      <!-- Tabla de Alerta Temprana -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso Afectado</th>
              <th style="text-align: center;">Asistencia</th>
              <th style="text-align: center;">Nota Final</th>
              <th style="text-align: center;">Z-Score</th>
              <th style="text-align: center;">Nivel de Riesgo</th>
              <th>Diagnóstico / Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredStudents">
              <td>
                <div class="student-cell">
                  <strong>{{ item.nombre }}</strong>
                  <span class="student-code">{{ item.estudiante_id }}</span>
                </div>
              </td>
              <td>{{ item.curso_nombre }}</td>
              <td style="text-align: center;">
                <span [class.text-danger]="item.asistencia < 70" [class.fw-bold]="item.asistencia < 70">
                  {{ item.asistencia }}%
                </span>
              </td>
              <td style="text-align: center;">
                <span [class.text-danger]="item.nota_final < 10.5" [class.fw-bold]="item.nota_final < 10.5">
                  {{ item.nota_final | number:'1.1-1' }}
                </span>
              </td>
              <td style="text-align: center;">
                <code class="z-badge" [class.z-negative]="item.z_score < 0">
                  {{ item.z_score }}
                </code>
              </td>
              <td style="text-align: center;">
                <span class="badge" [ngClass]="item.nivel_riesgo === 'ALTO RIESGO' ? 'badge-danger' : 'badge-warning'">
                  {{ item.nivel_riesgo }}
                </span>
              </td>
              <td>
                <span class="reason-text">{{ item.motivo }}</span>
              </td>
            </tr>
            <tr *ngIf="filteredStudents.length === 0">
              <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                No se registran alumnos en riesgo bajo los criterios seleccionados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .risk-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .stats-pills {
      display: flex;
      gap: 0.5rem;
    }

    .pill-count {
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .count-danger { background: var(--danger-bg); color: var(--danger); border: 1px solid #fecaca; }
    .count-warning { background: var(--warning-bg); color: var(--warning); border: 1px solid #fde68a; }

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filter-toggle {
      display: flex;
      gap: 0.4rem;
    }

    .toggle-btn {
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
      border: 1px solid var(--border-color);
      background: white;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .toggle-btn:hover {
      background: #f8fafc;
    }

    .toggle-btn.active {
      background: #0f172a;
      color: white;
      border-color: #0f172a;
    }

    .student-cell {
      display: flex;
      flex-direction: column;
    }

    .student-code {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .text-danger { color: var(--danger); }
    .fw-bold { font-weight: 700; }

    .z-badge {
      padding: 0.15rem 0.4rem;
      background: #f1f5f9;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
    }

    .z-negative {
      background: #fee2e2;
      color: #991b1b;
    }

    .reason-text {
      font-size: 0.83rem;
      color: #475569;
    }
  `]
})
export class RiskTableComponent implements OnChanges {
  @Input() riskStudents: RiskStudentItem[] = [];

  filteredStudents: RiskStudentItem[] = [];
  searchQuery = '';
  selectedLevel = 'TODOS';

  get countAltoRiesgo(): number {
    return this.riskStudents.filter(s => s.nivel_riesgo === 'ALTO RIESGO').length;
  }

  get countRiesgoMedio(): number {
    return this.riskStudents.filter(s => s.nivel_riesgo === 'RIESGO MEDIO').length;
  }

  ngOnChanges(): void {
    this.filterData();
  }

  setLevel(level: string): void {
    this.selectedLevel = level;
    this.filterData();
  }

  filterData(): void {
    const q = this.searchQuery.toLowerCase().trim();

    this.filteredStudents = this.riskStudents.filter(item => {
      const matchesSearch =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        item.estudiante_id.toLowerCase().includes(q) ||
        item.curso_nombre.toLowerCase().includes(q);

      const matchesLevel =
        this.selectedLevel === 'TODOS' ||
        item.nivel_riesgo === this.selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }
}
