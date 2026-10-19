import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay, tap } from 'rxjs';
import {
  Character,
  Film,
  Planet,
  Species,
  Starship,
  SwapiCategory,
  SwapiCategoryMap,
  SwapiEntity,
  Vehicle,
} from '../models/swapi.models';

@Injectable({ providedIn: 'root' })
export class SwapiService {
  private readonly http = inject(HttpClient);
  private readonly urlCache = new Map<string, Observable<unknown>>();
  readonly baseUrl = 'https://swapi.info/api';

  getCategoryList<K extends SwapiCategory>(category: K): Observable<SwapiCategoryMap[K][]> {
    return this.getByUrl<SwapiCategoryMap[K][]>(`${this.baseUrl}/${category}`);
  }

  getCategoryItem<K extends SwapiCategory>(
    category: K,
    id: string | number,
  ): Observable<SwapiCategoryMap[K]> {
    return this.getByUrl<SwapiCategoryMap[K]>(`${this.baseUrl}/${category}/${id}`);
  }

  getFilms(): Observable<Film[]> {
    return this.getCategoryList('films');
  }

  getPeople(): Observable<Character[]> {
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
   * Clears the in-memory URL cache.
   */
  clearCache(): void {
    this.urlCache.clear();
  }

  private normalizeEntity(category: SwapiCategory, entity: SwapiEntity): SwapiEntity {
    switch (category) {
      case 'films':
        return this.normalizeFilm(entity as Film);
      case 'people':
        return this.normalizeCharacter(entity as Character);
      case 'planets':
        return this.normalizePlanet(entity as Planet);
      case 'species':
        return this.normalizeSpecies(entity as Species);
      case 'vehicles':
        return this.normalizeVehicle(entity as Vehicle);
      case 'starships':
        return this.normalizeStarship(entity as Starship);
    }
  }

  private normalizeFilm(film: Film): Film {
    return {
      ...film,
      id: this.extractSwapiId(film.url),
      characters: film.characters.map((url) => this.extractSwapiId(url)),
      planets: film.planets.map((url) => this.extractSwapiId(url)),
      starships: film.starships.map((url) => this.extractSwapiId(url)),
      vehicles: film.vehicles.map((url) => this.extractSwapiId(url)),
      species: film.species.map((url) => this.extractSwapiId(url)),
    };
  }

  private normalizeCharacter(character: Character): Character {
    return {
      ...character,
      id: this.extractSwapiId(character.url),
      homeworld: character.homeworld ? this.extractSwapiId(character.homeworld) : '',
      films: character.films.map((url) => this.extractSwapiId(url)),
      species: character.species.map((url) => this.extractSwapiId(url)),
      starships: character.starships.map((url) => this.extractSwapiId(url)),
      vehicles: character.vehicles.map((url) => this.extractSwapiId(url)),
    };
  }

  private normalizePlanet(planet: Planet): Planet {
    return {
      ...planet,
      id: this.extractSwapiId(planet.url),
      residents: planet.residents.map((url) => this.extractSwapiId(url)),
      films: planet.films.map((url) => this.extractSwapiId(url)),
    };
  }

  private normalizeSpecies(species: Species): Species {
    return {
      ...species,
      id: this.extractSwapiId(species.url),
      homeworld: species.homeworld ? this.extractSwapiId(species.homeworld) : null,
      people: species.people.map((url) => this.extractSwapiId(url)),
      films: species.films.map((url) => this.extractSwapiId(url)),
    };
  }

  private normalizeVehicle(vehicle: Vehicle): Vehicle {
    return {
      ...vehicle,
      id: this.extractSwapiId(vehicle.url),
      pilots: vehicle.pilots.map((url) => this.extractSwapiId(url)),
      films: vehicle.films.map((url) => this.extractSwapiId(url)),
    };
  }

  private normalizeStarship(starship: Starship): Starship {
    return {
      ...starship,
      id: this.extractSwapiId(starship.url),
      pilots: starship.pilots.map((url) => this.extractSwapiId(url)),
      films: starship.films.map((url) => this.extractSwapiId(url)),
    };
  }

  private extractSwapiId(url: string): string {
    const parts = url.replace(/\/+$/, '').split('/');
    return parts[parts.length - 1] ?? '';
  }

  /**
   * Fetches a SWAPI entity or list by its full URL, normalizes it, and caches the normalized result.
   * Evicts the cache entry if the request errors so retries can succeed.
   */
  private getByUrl<T extends SwapiEntity | SwapiEntity[]>(url: string): Observable<T> {
    const normalizedUrl = url.trim();
    const cached = this.urlCache.get(normalizedUrl) as Observable<T> | undefined;
    if (cached) {
      return cached;
    }

    const category = normalizedUrl
      .slice(this.baseUrl.length + 1)
      .split('/')[0] as SwapiCategory;

    const request$ = this.http.get<T>(normalizedUrl).pipe(
      map(
        (data) =>
          (Array.isArray(data)
            ? data.map((item) => this.normalizeEntity(category, item))
            : this.normalizeEntity(category, data)) as T,
      ),
      tap({
        error: () => this.urlCache.delete(normalizedUrl),
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.urlCache.set(normalizedUrl, request$);
    return request$;
  }
}
