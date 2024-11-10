import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CinemetaService {
  private apiUrl = 'https://v3-cinemeta.strem.io';

  constructor(private http: HttpClient) { }

  getMovie(imdbId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/meta/movie/${imdbId}.json`)
      .pipe(catchError(this.handleError));
  }

  getTvShow(imdbId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/meta/series/${imdbId}.json`)
      .pipe(catchError(this.handleError));
  }

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return httpParams;
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred', error);
    return throwError(() => new Error('Something went wrong'));
  }
}