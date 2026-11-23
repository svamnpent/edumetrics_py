import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from './services/analytics.service';
import {
  KPISummary,
  CorrelacionResponse,
  DesaprobadosPorCurso,
  StudentRankingItem,
  RiskStudentItem
} from './models/analytics.models';

import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { CorrelationChartComponent } from './components/correlation-chart/correlation-chart.component';
import { CourseFailureChartComponent } from './components/course-failure-chart/course-failure-chart.component';
import { RankingTableComponent } from './components/ranking-table/ranking-table.component';
import { RiskTableComponent } from './components/risk-table/risk-table.component';
import { CsvUploaderComponent } from './components/csv-uploader/csv-uploader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardsComponent,
    CorrelationChartComponent,
    CourseFailureChartComponent,
    RankingTableComponent,
    RiskTableComponent,
    CsvUploaderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly cdr = inject(ChangeDetectorRef);

  activeTab: 'dashboard' | 'ranking' | 'riesgo' | 'carga' = 'dashboard';
  isLoading = true;
  hasError = false;

  kpis: KPISummary | null = null;
  correlationData: CorrelacionResponse | null = null;
  coursesData: DesaprobadosPorCurso[] = [];
  rankingData: StudentRankingItem[] = [];
  riskData: RiskStudentItem[] = [];

  ngOnInit(): void {
    this.loadAllData();

    // Escuchar actualizaciones de carga de CSV o seed de datos
    this.analyticsService.onDataUpdated.subscribe(() => {
      this.loadAllData();
    });
  }

  setTab(tab: 'dashboard' | 'ranking' | 'riesgo' | 'carga'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    // Coordinar peticiones HTTP en paralelo con forkJoin
    forkJoin({
      kpis: this.analyticsService.getKpis(),
      correlacion: this.analyticsService.getCorrelacion(),
      cursos: this.analyticsService.getDesaprobadosPorCurso(),
      ranking: this.analyticsService.getRanking(),
      riesgo: this.analyticsService.getEstudiantesRiesgo()
    }).subscribe({
      next: (data) => {
        this.kpis = data.kpis;
        this.correlationData = data.correlacion;
        this.coursesData = data.cursos;
        this.rankingData = data.ranking;
        this.riskData = data.riesgo;
        this.isLoading = false;
        this.hasError = false;
        // Forzar detección de cambios en Angular Zoneless
        this.cdr.markForCheck();
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
