import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StreamTapeService {
  private apiUrl = 'https://api.streamtape.com';
  private login = 'cdae75125a7954138fff';
  private key = '4PmRRvb191iK0vk';

  constructor(private http: HttpClient) { }

  listFolderFiles(folderId: string): Observable<any> {
    const params = this.buildParams({ folder: folderId });
    return this.http.get(`${this.apiUrl}/file/listfolder`, { params })
      .pipe(catchError(this.handleError));
  }

  createDownloadTicket(fileId: string): Observable<any> {
    const params = this.buildParams({ file: fileId });
    return this.http.get(`${this.apiUrl}/dlticket`, { params })
      .pipe(catchError(this.handleError));
  }

  getDownloadLink(fileId: string, downloadTicket: string): Observable<any> {
    const params = this.buildParams({ file: fileId, ticket: downloadTicket });
    return this.http.get(`${this.apiUrl}/dl`, { params })
      .pipe(catchError(this.handleError));
  }

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams().set('login', this.login).set('key', this.key);
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