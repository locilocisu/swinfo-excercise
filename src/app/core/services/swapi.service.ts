import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { forkJoin, Observable, of, shareReplay, tap } from 'rxjs';
import {
  Film,
  Person,
  Planet,
  Species,
  Starship,
  SwapiCategory,
  SwapiCategoryMap,
  SwapiRoot,
  Vehicle,
} from '../models/swapi.models';

@Injectable({ providedIn: 'root' })
export class SwapiService {
  private readonly http = inject(HttpClient);
  private readonly urlCache = new Map<string, Observable<unknown>>();
  readonly baseUrl = 'https://swapi.info/api';

  getRoot(): Observable<SwapiRoot> {
    return this.http.get<SwapiRoot>(this.baseUrl);
  }

  getCategoryList<K extends SwapiCategory>(category: K): Observable<SwapiCategoryMap[K][]> {
    return this.http.get<SwapiCategoryMap[K][]>(`${this.baseUrl}/${category}`);
  }

  getCategoryItem<K extends SwapiCategory>(
    category: K,
    id: string | number,
  ): Observable<SwapiCategoryMap[K]> {
    return this.http.get<SwapiCategoryMap[K]>(`${this.baseUrl}/${category}/${id}`);
  }

  getFilms(): Observable<Film[]> {
    return this.getCategoryList('films');
  }

  getPeople(): Observable<Person[]> {
    return this.getCategoryList('people');
  }

  getPlanets(): Observable<Planet[]> {
    return this.getCategoryList('planets');
  }

  getSpecies(): Observable<Species[]> {
    return this.getCategoryList('species');
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.getCategoryList('vehicles');
  }

  getStarships(): Observable<Starship[]> {
    return this.getCategoryList('starships');
  }

  /**
   * Fetches a SWAPI entity by its full URL with in-memory caching.
   * Evicts the cache entry if the request errors so retries can succeed.
   */
  getByUrl<T>(url: string): Observable<T> {
    const normalizedUrl = url.trim();
    const cached = this.urlCache.get(normalizedUrl) as Observable<T> | undefined;
    if (cached) {
      return cached;
    }

    const request$ = this.http.get<T>(normalizedUrl).pipe(
      tap({
        error: () => this.urlCache.delete(normalizedUrl),
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.urlCache.set(normalizedUrl, request$);
    return request$;
  }

  /**
   * Fetches multiple SWAPI entities in parallel from an array of resource URLs.
   */
  getManyByUrls<T>(urls: readonly string[]): Observable<T[]> {
    if (!urls.length) {
      return of([]);
    }
    return forkJoin(urls.map((url) => this.getByUrl<T>(url)));
  }

  /**
   * Clears the in-memory URL cache.
   */
  clearCache(): void {
    this.urlCache.clear();
  }

  /**
   * Signal-based reactive resource loader for any SWAPI category list.
   */
  createCategoryResource<K extends SwapiCategory>(
    category: Signal<K>,
  ): HttpResourceRef<SwapiCategoryMap[K][] | undefined> {
    return httpResource<SwapiCategoryMap[K][]>(() => `${this.baseUrl}/${category()}`);
  }
}
