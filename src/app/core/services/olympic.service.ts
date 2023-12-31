import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, map, tap } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';

/**
 * Service class for Olympic.
 */
@Injectable({
  providedIn: 'root',
})
export class OlympicService {

  private olympicUrl = './assets/mock/olympic.json';
  private _olympics = new BehaviorSubject<Olympic[]>([]);
  private _loading = new BehaviorSubject<Boolean>(false);
  private _error = new BehaviorSubject<String>('');

  isLoading$ = this._loading.asObservable();
  error$ = this._error.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load initial data.
   * @returns {Observable<Olympic[]>} An Olympic array observable. 
   */
  loadInitialData(): Observable<Olympic[]> {
    this._loading.next(true);
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      tap((value) => {
        if (Array.isArray(value) && value.length > 0) {
          this._error.next('');
          this._olympics.next(value);
        } else {
          this._error.next('No data found');
        }
      }),
      catchError((error, caught) => {
        this._error.next('An error occured retrieving data');
        throw caught;
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Get all Olympics.
   * @returns {Observable<Olympic[]>} An Olympic array observable.
   */
  getOlympics(): Observable<Olympic[]> {
    return this._olympics.asObservable().pipe(
      filter(value => Array.isArray(value) && value.length > 0)
    );
  }

  /**
   * Get one Olympic item by id.
   * @param {number}  id  The id of the item. 
   * @returns {Olympic} An olympic item.
   */
  getOlympicById(id: number): Observable<Olympic> {
    return this._olympics.asObservable().pipe(
      filter(value => Array.isArray(value) && value.length > 0),
      map( olympics => {
        let filtered = olympics.filter( olympic => olympic.id == id );
        if (filtered.length != 1) {
          throw new Error('Country not found')
        }
        return filtered[0];
      })
    );
  }
}
