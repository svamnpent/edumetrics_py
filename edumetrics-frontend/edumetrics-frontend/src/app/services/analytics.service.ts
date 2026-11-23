import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import {
  KPISummary,
  CorrelacionResponse,
  DesaprobadosPorCurso,
  StudentRankingItem,
  RiskStudentItem,
  CsvUploadResponse,
  SeedResponse
} from '../models/analytics.models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api/v1';

  // Notificador reactivo para refrescar datos cuando se sube un CSV o se puebla la BD
  private readonly dataUpdated$ = new Subject<void>();

  get onDataUpdated(): Observable<void> {
    return this.dataUpdated$.asObservable();
  }

  notifyUpdate(): void {
    this.dataUpdated$.next();
  }

  getKpis(): Observable<KPISummary> {
    return this.http.get<KPISummary>(`${this.baseUrl}/analytics/kpis`);
  }

  getCorrelacion(): Observable<CorrelacionResponse> {
    return this.http.get<CorrelacionResponse>(`${this.baseUrl}/analytics/correlacion`);
  }

  getDesaprobadosPorCurso(): Observable<DesaprobadosPorCurso[]> {
    return this.http.get<DesaprobadosPorCurso[]>(`${this.baseUrl}/analytics/desaprobados-por-curso`);
  }

  getRanking(): Observable<StudentRankingItem[]> {
    return this.http.get<StudentRankingItem[]>(`${this.baseUrl}/analytics/ranking`);
  }

  getEstudiantesRiesgo(): Observable<RiskStudentItem[]> {
    return this.http.get<RiskStudentItem[]>(`${this.baseUrl}/analytics/estudiantes-riesgo`);
  }

  uploadCsv(file: File): Observable<CsvUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<CsvUploadResponse>(`${this.baseUrl}/matriculas/upload-csv`, formData).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  seedData(): Observable<SeedResponse> {
    return this.http.post<SeedResponse>(`${this.baseUrl}/matriculas/seed`, {}).pipe(
      tap(() => this.notifyUpdate())
    );
  }
}
