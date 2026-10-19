import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  Film,
  Character,
  Planet,
  Species,
  Starship,
  Vehicle,
} from '../../core/models/swapi.models';
import { SwapiService } from '../../core/services/swapi.service';
import { CharacterDatapad } from './character-datapad';

describe('CharacterDatapad', () => {
  let fixture: ComponentFixture<CharacterDatapad>;
  let component: CharacterDatapad;
  let swapiServiceMock: {
    getPeople: ReturnType<typeof vi.fn>;
    getFilms: ReturnType<typeof vi.fn>;
    getCategoryItem: ReturnType<typeof vi.fn>;
  };

  const baseUrl = 'https://swapi.info/api';

  const mockLuke: Character = {
    id: '1',
    name: 'Luke Skywalker',
    height: '172',
    mass: '77',
    hair_color: 'blond',
    skin_color: 'fair',
    eye_color: 'blue',
    birth_year: '19BBY',
    gender: 'male',
    homeworld: '1',
    films: ['1'],
    species: ['1'],
    vehicles: ['14'],
    starships: ['12'],
    created: '2014-12-09T13:50:51.644000Z',
    edited: '2014-12-20T21:17:56.891000Z',
    url: `${baseUrl}/people/1`,
  };

  const mockC3po: Character = {
    id: '2',
    name: 'C-3PO',
    height: '167',
    mass: '75',
    hair_color: 'n/a',
    skin_color: 'gold',
    eye_color: 'yellow',
    birth_year: '112BBY',
    gender: 'n/a',
    homeworld: '1',
    films: ['1', '4'],
    species: [],
    vehicles: [],
    starships: [],
    created: '2014-12-10T15:10:51.357000Z',
    edited: '2014-12-20T21:17:50.309000Z',
    url: `${baseUrl}/people/2`,
  };

  const mockFilms: Film[] = [
    {
      id: '1',
      title: 'A New Hope',
      episode_id: 4,
      opening_crawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      release_date: '1977-05-25',
      characters: ['1', '2'],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
      created: '',
      edited: '',
      url: `${baseUrl}/films/1`,
    },
    {
      id: '4',
      title: 'The Phantom Menace',
      episode_id: 1,
      opening_crawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      release_date: '1999-05-19',
      characters: ['2'],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
      created: '',
      edited: '',
      url: `${baseUrl}/films/4`,
    },
  ];

  const mockTatooine: Planet = {
    id: '1',
    name: 'Tatooine',
    rotation_period: '23',
    orbital_period: '304',
    diameter: '10465',
    climate: 'arid',
    gravity: '1 standard',
    terrain: 'desert',
    surface_water: '1',
    population: '200000',
    residents: [],
    films: [],
    created: '',
    edited: '',
    url: `${baseUrl}/planets/1`,
  };

  const mockHuman: Species = {
    id: '1',
    name: 'Human',
    classification: 'mammal',
    designation: 'sentient',
    average_height: '180',
    skin_colors: 'caucasian, black, asian, hispanic',
    hair_colors: 'blonde, brown, black, red',
    eye_colors: 'brown, blue, green',
    average_lifespan: '120',
    homeworld: '9',
    language: 'Galactic Basic',
    people: [],
    films: [],
    created: '',
    edited: '',
    url: `${baseUrl}/species/1`,
  };

  const mockXWing: Starship = {
    id: '12',
    name: 'X-wing',
    model: 'T-65 X-wing',
    manufacturer: 'Incom Corporation',
    cost_in_credits: '149999',
    length: '12.5',
    max_atmosphering_speed: '1050',
    crew: '1',
    passengers: '0',
    cargo_capacity: '110',
    consumables: '1 week',
    hyperdrive_rating: '1.0',
    MGLT: '100',
    starship_class: 'Starfighter',
    pilots: ['1'],
    films: [],
    created: '',
    edited: '',
    url: `${baseUrl}/starships/12`,
  };

  const mockSnowspeeder: Vehicle = {
    id: '14',
    name: 'Snowspeeder',
    model: 't-47 airspeeder',
    manufacturer: 'Incom corporation',
    cost_in_credits: 'unknown',
    length: '4.5',
    max_atmosphering_speed: '650',
    crew: '2',
    passengers: '0',
    cargo_capacity: '10',
    consumables: 'none',
    vehicle_class: 'airspeeder',
    pilots: ['1'],
    films: [],
    created: '',
    edited: '',
    url: `${baseUrl}/vehicles/14`,
  };

  beforeEach(async () => {
    swapiServiceMock = {
      getPeople: vi.fn().mockReturnValue(of([mockLuke, mockC3po])),
      getFilms: vi.fn().mockReturnValue(of(mockFilms)),
      getCategoryItem: vi.fn().mockImplementation((category: string) => {
        switch (category) {
          case 'planets':
            return of(mockTatooine);
          case 'species':
            return of(mockHuman);
          case 'starships':
            return of(mockXWing);
          case 'vehicles':
            return of(mockSnowspeeder);
          default:
            return of(null);
        }
      }),
    };

    await TestBed.configureTestingModule({
      imports: [CharacterDatapad],
      providers: [{ provide: SwapiService, useValue: swapiServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterDatapad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load characters sorted alphabetically, extract related IDs on retrieval, and select Luke Skywalker by default', () => {
    expect(component.sortedCharacters().map((p) => p.name)).toEqual(['C-3PO', 'Luke Skywalker']);
    const selected = component.selectedCharacter();
    expect(selected?.name).toBe('Luke Skywalker');
    expect(selected?.homeworld).toBe('1');
    expect(selected?.species).toEqual(['1']);
    expect(selected?.starships).toEqual(['12']);
    expect(selected?.vehicles).toEqual(['14']);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.character-name')?.textContent).toContain('Luke Skywalker');
  });

  it('should filter characters when searching and show empty state when no character matches', () => {
    component.updateSearch('c-3');
    fixture.detectChanges();

    expect(component.filteredCharacters().length).toBe(1);
    expect(component.filteredCharacters()[0].name).toBe('C-3PO');

    component.updateSearch('non-existent-character');
    fixture.detectChanges();

    expect(component.filteredCharacters().length).toBe(0);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No characters match "non-existent-character"');
  });

  it('should display attributes, species, homeworld, films, starships, and vehicles for the selected character', () => {
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('172 cm');
    expect(el.textContent).toContain('77 kg');
    expect(el.textContent).toContain('Human');
    expect(el.textContent).toContain('Galactic Basic');
    expect(el.textContent).toContain('Tatooine');
    expect(el.textContent).toContain('200,000');
    expect(el.textContent).toContain('10,465 km');
    expect(el.textContent).toContain('X-wing');
    expect(el.textContent).toContain('Snowspeeder');

    // Aurebesh representations next to character name, species name, and homeworld planet name
    expect(el.querySelector('.character-aurebesh')?.textContent?.trim()).toBe('Luke Skywalker');
    expect(el.querySelector('.species-aurebesh')?.textContent?.trim()).toBe('Human');
    expect(el.querySelector('.planet-aurebesh')?.textContent?.trim()).toBe('Tatooine');

    // Films sorted by episode_id (Episode I first, then Episode IV)
    expect(component.sortedFilms().map((f) => f.episode_id)).toEqual([1, 4]);
    expect(component.appearsInFilm(mockFilms[0])).toBe(true); // Episode IV
    expect(component.appearsInFilm(mockFilms[1])).toBe(false); // Episode I
  });

  it('should treat a character with an empty species array as Human (species/1) and show empty states for starships/vehicles', () => {
    swapiServiceMock.getCategoryItem.mockClear();
    component.selectCharacter(mockC3po);
    fixture.detectChanges();

    expect(component.selectedCharacter()?.name).toBe('C-3PO');
    expect(swapiServiceMock.getCategoryItem).toHaveBeenCalledWith('species', '1');
    expect(component.speciesList()).toEqual([mockHuman]);
    expect(component.starshipsList()).toEqual([]);
    expect(component.vehiclesList()).toEqual([]);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Human');
    expect(el.querySelector('.species-aurebesh')?.textContent?.trim()).toBe('Human');
    expect(el.textContent).toContain('No starships piloted by this character.');
    expect(el.textContent).toContain('No vehicles piloted by this character.');
  });

  it('should not show Aurebesh for homeworld planet name when the planet name is unknown', () => {
    swapiServiceMock.getCategoryItem.mockImplementation((category: string) => {
      if (category === 'planets') {
        return of({
          ...mockTatooine,
          name: 'unknown',
        });
      }
      return of(mockHuman);
    });

    component.retrySelectedCharacterDetails();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.planet-aurebesh')).toBeNull();
  });

  it('should communicate error state when character loading fails', () => {
    swapiServiceMock.getPeople.mockReturnValueOnce(throwError(() => new Error('Network error')));
    component.loadCharacters();
    fixture.detectChanges();

    expect(component.charactersError()).toBe('Unable to load characters from the Star Wars API.');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Unable to load characters from the Star Wars API.');
  });
});
