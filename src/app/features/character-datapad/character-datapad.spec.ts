import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  Film,
  Person,
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
    getByUrl: ReturnType<typeof vi.fn>;
    getManyByUrls: ReturnType<typeof vi.fn>;
  };

  const baseUrl = 'https://swapi.info/api';

  const mockLuke: Person = {
    name: 'Luke Skywalker',
    height: '172',
    mass: '77',
    hair_color: 'blond',
    skin_color: 'fair',
    eye_color: 'blue',
    birth_year: '19BBY',
    gender: 'male',
    homeworld: `${baseUrl}/planets/1`,
    films: [`${baseUrl}/films/1`],
    species: [`${baseUrl}/species/1`],
    vehicles: [`${baseUrl}/vehicles/14`],
    starships: [`${baseUrl}/starships/12`],
    created: '2014-12-09T13:50:51.644000Z',
    edited: '2014-12-20T21:17:56.891000Z',
    url: `${baseUrl}/people/1`,
  };

  const mockC3po: Person = {
    name: 'C-3PO',
    height: '167',
    mass: '75',
    hair_color: 'n/a',
    skin_color: 'gold',
    eye_color: 'yellow',
    birth_year: '112BBY',
    gender: 'n/a',
    homeworld: `${baseUrl}/planets/1`,
    films: [`${baseUrl}/films/1`, `${baseUrl}/films/4`],
    species: [],
    vehicles: [],
    starships: [],
    created: '2014-12-10T15:10:51.357000Z',
    edited: '2014-12-20T21:17:50.309000Z',
    url: `${baseUrl}/people/2`,
  };

  const mockFilms: Film[] = [
    {
      title: 'A New Hope',
      episode_id: 4,
      opening_crawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      release_date: '1977-05-25',
      characters: [`${baseUrl}/people/1`, `${baseUrl}/people/2`],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
      created: '',
      edited: '',
      url: `${baseUrl}/films/1`,
    },
    {
      title: 'The Phantom Menace',
      episode_id: 1,
      opening_crawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      release_date: '1999-05-19',
      characters: [`${baseUrl}/people/2`],
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
    name: 'Human',
    classification: 'mammal',
    designation: 'sentient',
    average_height: '180',
    skin_colors: 'caucasian, black, asian, hispanic',
    hair_colors: 'blonde, brown, black, red',
    eye_colors: 'brown, blue, green',
    average_lifespan: '120',
    homeworld: `${baseUrl}/planets/9`,
    language: 'Galactic Basic',
    people: [],
    films: [],
    created: '',
    edited: '',
    url: `${baseUrl}/species/1`,
  };

  const mockXWing: Starship = {
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
    pilots: [`${baseUrl}/people/1`],
    films: [],
    created: '',
    edited: '',
    url: `${baseUrl}/starships/12`,
  };

  const mockSnowspeeder: Vehicle = {
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
    pilots: [`${baseUrl}/people/1`],
    films: [],
    created: '',
    edited: '',
    url: `${baseUrl}/vehicles/14`,
  };

  beforeEach(async () => {
    swapiServiceMock = {
      getPeople: vi.fn().mockReturnValue(of([mockLuke, mockC3po])),
      getFilms: vi.fn().mockReturnValue(of(mockFilms)),
      getByUrl: vi.fn().mockReturnValue(of(mockTatooine)),
      getManyByUrls: vi.fn().mockImplementation((urls: string[]) => {
        if (urls[0]?.includes('/species/')) {
          return of([mockHuman]);
        }
        if (urls[0]?.includes('/starships/')) {
          return of([mockXWing]);
        }
        if (urls[0]?.includes('/vehicles/')) {
          return of([mockSnowspeeder]);
        }
        return of([]);
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

  it('should load characters sorted alphabetically and select Luke Skywalker by default', () => {
    expect(component.sortedCharacters().map((p) => p.name)).toEqual(['C-3PO', 'Luke Skywalker']);
    expect(component.selectedCharacter()?.name).toBe('Luke Skywalker');

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

    // Films sorted by episode_id (Episode I first, then Episode IV)
    expect(component.sortedFilms().map((f) => f.episode_id)).toEqual([1, 4]);
    expect(component.appearsInFilm(mockFilms[0])).toBe(true); // Episode IV
    expect(component.appearsInFilm(mockFilms[1])).toBe(false); // Episode I
  });

  it('should switch selected character and show empty states when related arrays are empty', () => {
    component.selectCharacter(mockC3po);
    fixture.detectChanges();

    expect(component.selectedCharacter()?.name).toBe('C-3PO');
    expect(component.speciesList()).toEqual([]);
    expect(component.starshipsList()).toEqual([]);
    expect(component.vehiclesList()).toEqual([]);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Unspecified');
    expect(el.textContent).toContain('No starships piloted by this character.');
    expect(el.textContent).toContain('No vehicles piloted by this character.');
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
