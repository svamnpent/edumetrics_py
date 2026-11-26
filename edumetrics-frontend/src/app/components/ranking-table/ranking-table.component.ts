import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentRankingItem } from '../../models/analytics.models';

@Component({
  selector: 'app-ranking-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="ranking-header">
        <div>
          <h2 class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
            Cuadro de Honor y Ranking Ponderado
          </h2>
          <p class="card-subtitle">
            Cálculo de percentiles acumulados y clasificación de mérito académico
          </p>
        </div>

        <div class="actions-bar">
          <input
            type="text"
            class="search-input"
            placeholder="Buscar por alumno, código o carrera..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterData()"
          />
        </div>
      </div>

      <!-- Filtros por Categoría de Mérito -->
      <div class="filter-pills">
        <button
          class="pill-btn"
          [class.active]="selectedCategory === 'TODOS'"
          (click)="setCategory('TODOS')"
        >
          Todos ({{ ranking.length }})
        </button>
        <button
          class="pill-btn pill-gold"
          [class.active]="selectedCategory === 'Décimo Superior'"
          (click)="setCategory('Décimo Superior')"
        >
          🏆 Décimo Superior
        </button>
        <button
          class="pill-btn pill-silver"
          [class.active]="selectedCategory === 'Quinto Superior'"
          (click)="setCategory('Quinto Superior')"
        >
          🥈 Quinto Superior
        </button>
        <button
          class="pill-btn pill-bronze"
          [class.active]="selectedCategory === 'Tercio Superior'"
          (click)="setCategory('Tercio Superior')"
        >
          🥉 Tercio Superior
        </button>
      </div>

      <!-- Tabla de Ranking -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 80px;">Puesto</th>
              <th>Código</th>
              <th>Estudiante</th>
              <th>Carrera</th>
              <th style="text-align: right;">Prom. Ponderado</th>
              <th style="text-align: center;">Mérito Académico</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredRanking">
              <td>
                <span class="rank-badge" [ngClass]="getRankClass(item.puesto)">
                  {{ item.puesto }}
                </span>
              </td>
              <td><code>{{ item.estudiante_id }}</code></td>
              <td><strong>{{ item.nombre }}</strong></td>
              <td>{{ item.carrera }}</td>
              <td style="text-align: right; font-weight: 700; color: var(--primary);">
                {{ item.promedio_ponderado | number:'1.2-2' }}
              </td>
              <td style="text-align: center;">
                <span class="badge" [ngClass]="getCategoryBadgeClass(item.categoria_rendimiento)">
                  {{ item.categoria_rendimiento }}
                </span>
              </td>
            </tr>
            <tr *ngIf="filteredRanking.length === 0">
              <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                No se encontraron estudiantes con los filtros aplicados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .ranking-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filter-pills {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .pill-btn {
      padding: 0.35rem 0.8rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pill-btn:hover {
      background: #f8fafc;
    }

    .pill-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.85rem;
      background: #f1f5f9;
      color: var(--text-muted);
    }

    .rank-gold {
      background: #fef3c7;
      color: #b45309;
      box-shadow: 0 0 0 2px #f59e0b;
    }

    .rank-silver {
      background: #f3f4f6;
      color: #4b5563;
      box-shadow: 0 0 0 2px #9ca3af;
    }

    .rank-bronze {
      background: #ffedd5;
      color: #9a3412;
      box-shadow: 0 0 0 2px #ea580c;
    }

    .badge-decimo { background: #fef3c7; color: #92400e; }
    .badge-quinto { background: #f3f4f6; color: #374151; }
    .badge-tercio { background: #e0e7ff; color: #3730a3; }
    .badge-regular { background: #f8fafc; color: #64748b; }
  `]
})
export class RankingTableComponent implements OnChanges {
  @Input() ranking: StudentRankingItem[] = [];

  filteredRanking: StudentRankingItem[] = [];
  searchQuery = '';
  selectedCategory = 'TODOS';

  ngOnChanges(): void {
    this.filterData();
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.filterData();
  }

  filterData(): void {
    const q = this.searchQuery.toLowerCase().trim();

    this.filteredRanking = this.ranking.filter(item => {
      const matchesSearch =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        item.estudiante_id.toLowerCase().includes(q) ||
        item.carrera.toLowerCase().includes(q);

      const matchesCat =
        this.selectedCategory === 'TODOS' ||
        item.categoria_rendimiento === this.selectedCategory;

      return matchesSearch && matchesCat;
    });
  }

  getRankClass(puesto: number): string {
    if (puesto === 1) return 'rank-gold';
    if (puesto === 2) return 'rank-silver';
    if (puesto === 3) return 'rank-bronze';
    return '';
  }

  getCategoryBadgeClass(categoria: string): string {
    switch (categoria) {
      case 'Décimo Superior': return 'badge-decimo';
      case 'Quinto Superior': return 'badge-quinto';
      case 'Tercio Superior': return 'badge-tercio';
      default: return 'badge-regular';
    }
  }
}
