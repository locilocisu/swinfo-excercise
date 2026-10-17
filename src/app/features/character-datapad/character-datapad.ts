import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import {
  Film,
  Person,
  Planet,
  Species,
  Starship,
  Vehicle,
} from '../../core/models/swapi.models';
import {
  AurebeshTextPipe,
  EpisodeRomanPipe,
  SwapiMetricPipe,
} from '../../core/pipes/swapi-pipes';
import { SwapiService } from '../../core/services/swapi.service';

export interface CharacterAttributeRow {
  label: string;
  value: string;
  unit?: string;
}

@Component({
  selector: 'app-character-datapad',
  imports: [
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    SwapiMetricPipe,
    EpisodeRomanPipe,
    AurebeshTextPipe,
  ],
  templateUrl: './character-datapad.html',
  styleUrl: './character-datapad.scss',
})
export class CharacterDatapad implements OnInit {
  private readonly swapiService = inject(SwapiService);
  private readonly destroyRef = inject(DestroyRef);
  private detailsSubscription = new Subscription();

  readonly attributeColumns: readonly string[] = ['label', 'value'];

  // Characters list state
  readonly characters = signal<Person[]>([]);
  readonly charactersLoading = signal<boolean>(true);
  readonly charactersError = signal<string | null>(null);
  readonly searchQuery = signal<string>('');
  readonly selectedCharacterUrl = signal<string | null>(null);

  // All films state (for the Episode I-VI timeline bar)
  readonly allFilms = signal<Film[]>([]);
  readonly filmsLoading = signal<boolean>(true);
  readonly filmsError = signal<string | null>(null);

  // Selected character related resources state
  readonly speciesList = signal<Species[]>([]);
  readonly speciesLoading = signal<boolean>(false);
  readonly speciesError = signal<string | null>(null);

  readonly homeworld = signal<Planet | null>(null);
  readonly homeworldLoading = signal<boolean>(false);
  readonly homeworldError = signal<string | null>(null);

  readonly starshipsList = signal<Starship[]>([]);
  readonly starshipsLoading = signal<boolean>(false);
  readonly starshipsError = signal<string | null>(null);

  readonly vehiclesList = signal<Vehicle[]>([]);
  readonly vehiclesLoading = signal<boolean>(false);
  readonly vehiclesError = signal<string | null>(null);

  readonly sortedCharacters = computed<Person[]>(() =>
    [...this.characters()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  readonly filteredCharacters = computed<Person[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.sortedCharacters();
    if (!query) {
      return list;
    }
    return list.filter((person) => person.name.toLowerCase().includes(query));
  });

  readonly selectedCharacter = computed<Person | null>(() => {
    const url = this.selectedCharacterUrl();
    if (!url) {
      return null;
    }
    return this.characters().find((person) => person.url === url) ?? null;
  });

  readonly attributeRows = computed<CharacterAttributeRow[]>(() => {
    const character = this.selectedCharacter();
    if (!character) {
      return [];
    }
    return [
      { label: 'Birth year', value: character.birth_year },
      { label: 'Gender', value: character.gender },
      { label: 'Height', value: character.height, unit: 'cm' },
      { label: 'Mass', value: character.mass, unit: 'kg' },
      { label: 'Eye color', value: character.eye_color },
      { label: 'Hair color', value: character.hair_color },
      { label: 'Skin color', value: character.skin_color },
    ];
  });

  readonly sortedFilms = computed<Film[]>(() =>
    [...this.allFilms()].sort((a, b) => a.episode_id - b.episode_id),
  );

  private readonly characterFilmUrlSet = computed<ReadonlySet<string>>(
    () => new Set(this.selectedCharacter()?.films ?? []),
  );

  constructor() {
    effect(() => {
      const character = this.selectedCharacter();
      this.loadCharacterRelatedData(character);
    });

    this.destroyRef.onDestroy(() => {
      this.detailsSubscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.loadCharacters();
    this.loadFilms();
  }

  loadCharacters(): void {
    this.charactersLoading.set(true);
    this.charactersError.set(null);

    this.swapiService
      .getPeople()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (people) => {
          this.characters.set(people);
          this.charactersLoading.set(false);

          if (!this.selectedCharacterUrl() && people.length > 0) {
            const defaultPerson =
              people.find((p) => p.name.toLowerCase() === 'luke skywalker') ??
              [...people].sort((a, b) => a.name.localeCompare(b.name))[0];
            this.selectedCharacterUrl.set(defaultPerson.url);
          }
        },
        error: () => {
          this.charactersLoading.set(false);
          this.charactersError.set('Unable to load characters from the Star Wars API.');
        },
      });
  }

  loadFilms(): void {
    this.filmsLoading.set(true);
    this.filmsError.set(null);

    this.swapiService
      .getFilms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (films) => {
          this.allFilms.set(films);
          this.filmsLoading.set(false);
        },
        error: () => {
          this.filmsLoading.set(false);
          this.filmsError.set('Unable to load film appearances.');
        },
      });
  }

  selectCharacter(person: Person): void {
    this.selectedCharacterUrl.set(person.url);
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
  }

  appearsInFilm(film: Film): boolean {
    return this.characterFilmUrlSet().has(film.url);
  }

  retrySelectedCharacterDetails(): void {
    this.loadCharacterRelatedData(this.selectedCharacter());
  }

  private loadCharacterRelatedData(character: Person | null): void {
    this.detailsSubscription.unsubscribe();
    this.detailsSubscription = new Subscription();

    if (!character) {
      this.speciesList.set([]);
      this.speciesLoading.set(false);
      this.speciesError.set(null);

      this.homeworld.set(null);
      this.homeworldLoading.set(false);
      this.homeworldError.set(null);

      this.starshipsList.set([]);
      this.starshipsLoading.set(false);
      this.starshipsError.set(null);

      this.vehiclesList.set([]);
      this.vehiclesLoading.set(false);
      this.vehiclesError.set(null);
      return;
    }

    this.loadSpeciesForCharacter(character);
    this.loadHomeworldForCharacter(character);
    this.loadStarshipsForCharacter(character);
    this.loadVehiclesForCharacter(character);
  }

  private loadSpeciesForCharacter(character: Person): void {
    this.speciesError.set(null);
    if (!character.species.length) {
      this.speciesList.set([]);
      this.speciesLoading.set(false);
      return;
    }

    this.speciesLoading.set(true);
    const sub = this.swapiService.getManyByUrls<Species>(character.species).subscribe({
      next: (species) => {
        this.speciesList.set(species);
        this.speciesLoading.set(false);
      },
      error: () => {
        this.speciesList.set([]);
        this.speciesLoading.set(false);
        this.speciesError.set('Failed to load species details.');
      },
    });
    this.detailsSubscription.add(sub);
  }

  private loadHomeworldForCharacter(character: Person): void {
    this.homeworldError.set(null);
    if (!character.homeworld) {
      this.homeworld.set(null);
      this.homeworldLoading.set(false);
      return;
    }

    this.homeworldLoading.set(true);
    const sub = this.swapiService.getByUrl<Planet>(character.homeworld).subscribe({
      next: (planet) => {
        this.homeworld.set(planet);
        this.homeworldLoading.set(false);
      },
      error: () => {
        this.homeworld.set(null);
        this.homeworldLoading.set(false);
        this.homeworldError.set('Failed to load homeworld details.');
      },
    });
    this.detailsSubscription.add(sub);
  }

  private loadStarshipsForCharacter(character: Person): void {
    this.starshipsError.set(null);
    if (!character.starships.length) {
      this.starshipsList.set([]);
      this.starshipsLoading.set(false);
      return;
    }

    this.starshipsLoading.set(true);
    const sub = this.swapiService.getManyByUrls<Starship>(character.starships).subscribe({
      next: (starships) => {
        this.starshipsList.set(starships);
        this.starshipsLoading.set(false);
      },
      error: () => {
        this.starshipsList.set([]);
        this.starshipsLoading.set(false);
        this.starshipsError.set('Failed to load starships.');
      },
    });
    this.detailsSubscription.add(sub);
  }

  private loadVehiclesForCharacter(character: Person): void {
    this.vehiclesError.set(null);
    if (!character.vehicles.length) {
      this.vehiclesList.set([]);
      this.vehiclesLoading.set(false);
      return;
    }

    this.vehiclesLoading.set(true);
    const sub = this.swapiService.getManyByUrls<Vehicle>(character.vehicles).subscribe({
      next: (vehicles) => {
        this.vehiclesList.set(vehicles);
        this.vehiclesLoading.set(false);
      },
      error: () => {
        this.vehiclesList.set([]);
        this.vehiclesLoading.set(false);
        this.vehiclesError.set('Failed to load vehicles.');
      },
    });
    this.detailsSubscription.add(sub);
  }
}
