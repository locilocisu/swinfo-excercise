import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Film, Person, Planet, Species, Starship, Vehicle } from '../models/swapi.models';
import { SwapiService } from './swapi.service';

describe('SwapiService', () => {
  let service: SwapiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://swapi.info/api';

  const mockFilm: Film = {
    title: 'A New Hope',
    episode_id: 4,
    opening_crawl: 'It is a period of civil war...',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1977-05-25',
    characters: [`${baseUrl}/people/1`],
    planets: [`${baseUrl}/planets/1`],
    starships: [`${baseUrl}/starships/2`],
    vehicles: [`${baseUrl}/vehicles/4`],
    species: [`${baseUrl}/species/1`],
    created: '2014-12-10T14:23:31.880000Z',
    edited: '2014-12-20T19:49:45.256000Z',
    url: `${baseUrl}/films/1`,
  };

  const mockPerson: Person = {
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
    species: [],
    vehicles: [`${baseUrl}/vehicles/14`],
    starships: [`${baseUrl}/starships/12`],
    created: '2014-12-09T13:50:51.644000Z',
    edited: '2014-12-20T21:17:56.891000Z',
    url: `${baseUrl}/people/1`,
  };

  const mockPlanet: Planet = {
    name: 'Tatooine',
    rotation_period: '23',
    orbital_period: '304',
    diameter: '10465',
    climate: 'arid',
    gravity: '1 standard',
    terrain: 'desert',
    surface_water: '1',
    population: '200000',
    residents: [`${baseUrl}/people/1`],
    films: [`${baseUrl}/films/1`],
    created: '2014-12-09T13:50:49.641000Z',
    edited: '2014-12-20T20:58:18.411000Z',
    url: `${baseUrl}/planets/1`,
  };

  const mockSpecies: Species = {
    name: 'Human',
    classification: 'mammal',
    designation: 'sentient',
    average_height: '180',
    skin_colors: 'caucasian, black, asian, hispanic',
    hair_colors: 'blonde, brown, black, red',
    eye_colors: 'brown, blue, green, hazel, grey, amber',
    average_lifespan: '120',
    homeworld: `${baseUrl}/planets/9`,
    language: 'Galactic Basic',
    people: [`${baseUrl}/people/66`],
    films: [`${baseUrl}/films/1`],
    created: '2014-12-10T13:52:11.567000Z',
    edited: '2014-12-20T21:36:42.136000Z',
    url: `${baseUrl}/species/1`,
  };

  const mockVehicle: Vehicle = {
    name: 'Sand Crawler',
    model: 'Digger Crawler',
    manufacturer: 'Corellia Mining Corporation',
    cost_in_credits: '150000',
    length: '36.8 ',
    max_atmosphering_speed: '30',
    crew: '46',
    passengers: '30',
    cargo_capacity: '50000',
    consumables: '2 months',
    vehicle_class: 'wheeled',
    pilots: [],
    films: [`${baseUrl}/films/1`],
    created: '2014-12-10T15:36:25.724000Z',
    edited: '2014-12-20T21:30:21.661000Z',
    url: `${baseUrl}/vehicles/4`,
  };

  const mockStarship: Starship = {
    name: 'CR90 corvette',
    model: 'CR90 corvette',
    manufacturer: 'Corellian Engineering Corporation',
    cost_in_credits: '3500000',
    length: '150',
    max_atmosphering_speed: '950',
    crew: '30-165',
    passengers: '600',
    cargo_capacity: '3000000',
    consumables: '1 year',
    hyperdrive_rating: '2.0',
    MGLT: '60',
    starship_class: 'corvette',
    pilots: [],
    films: [`${baseUrl}/films/1`],
    created: '2014-12-10T14:20:33.369000Z',
    edited: '2014-12-20T21:23:49.867000Z',
    url: `${baseUrl}/starships/2`,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SwapiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SwapiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with the expected base URL', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe('https://swapi.info/api');
  });

  it('getCategoryList() should call GET https://swapi.info/api/{category} and return category items', () => {
    let actual: Person[] | undefined;

    service.getCategoryList('people').subscribe((res) => {
      actual = res;
    });

    const req = httpMock.expectOne(`${baseUrl}/people`);
    expect(req.request.method).toBe('GET');
    req.flush([mockPerson]);

    expect(actual).toEqual([mockPerson]);
  });

  it('getCategoryItem() should call GET https://swapi.info/api/{category}/{id} and return the expected item', () => {
    let actual: Planet | undefined;

    service.getCategoryItem('planets', 1).subscribe((res) => {
      actual = res;
    });

    const req = httpMock.expectOne(`${baseUrl}/planets/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlanet);

    expect(actual).toEqual(mockPlanet);
  });

  it('getFilms() should call GET https://swapi.info/api/films and return Film[]', () => {
    let actual: Film[] | undefined;

    service.getFilms().subscribe((res) => {
      actual = res;
    });

    const req = httpMock.expectOne(`${baseUrl}/films`);
    expect(req.request.method).toBe('GET');
    req.flush([mockFilm]);

    expect(actual).toEqual([mockFilm]);
  });

  it('getPeople() should call GET https://swapi.info/api/people and return Person[]', () => {
    let actual: Person[] | undefined;

    service.getPeople().subscribe((res) => {
      actual = res;
    });

    const req = httpMock.expectOne(`${baseUrl}/people`);
    expect(req.request.method).toBe('GET');
    req.flush([mockPerson]);

    expect(actual).toEqual([mockPerson]);
  });

  it('getPlanets() should call GET https://swapi.info/api/planets and return Planet[]', () => {
    let actual: Planet[] | undefined;

    service.getPlanets().subscribe((res) => {
      actual = res;
    });

    const req = httpMock.expectOne(`${baseUrl}/planets`);
    expect(req.request.method).toBe('GET');
    req.flush([mockPlanet]);

    expect(actual).toEqual([mockPlanet]);
  });

  it('getSpecies() should call GET https://swapi.info/api/species and return Species[]', () => {
    let actual: Species[] | undefined;

    service.getSpecies().subscribe((res) => {
      actual = res;
    });

    const req = httpMock.expectOne(`${baseUrl}/species`);
    expect(req.request.method).toBe('GET');
    req.flush([mockSpecies]);

    expect(actual).toEqual([mockSpecies]);
  });

  it('getVehicles() should call GET https://swapi.info/api/vehicles and return Vehicle[]', () => {
    let actual: Vehicle[] | undefined;

    service.getVehicles().subscribe((res) => {
      actual = res;
    });

    const req = httpMock.expectOne(`${baseUrl}/vehicles`);
    expect(req.request.method).toBe('GET');
    req.flush([mockVehicle]);

    expect(actual).toEqual([mockVehicle]);
  });

  it('getStarships() should call GET https://swapi.info/api/starships and return Starship[]', () => {
    let actual: Starship[] | undefined;

    service.getStarships().subscribe((res) => {
      actual = res;
    });

    const req = httpMock.expectOne(`${baseUrl}/starships`);
    expect(req.request.method).toBe('GET');
    req.flush([mockStarship]);

    expect(actual).toEqual([mockStarship]);
  });

  it('getCategoryList() and getCategoryItem() should cache responses via urlCache and avoid duplicate HTTP requests', () => {
    let firstPlanet: Planet | undefined;
    let cachedPlanet: Planet | undefined;

    service.getCategoryItem('planets', 1).subscribe((res) => {
      firstPlanet = res;
    });

    const itemReq = httpMock.expectOne(`${baseUrl}/planets/1`);
    expect(itemReq.request.method).toBe('GET');
    itemReq.flush(mockPlanet);

    service.getCategoryItem('planets', 1).subscribe((res) => {
      cachedPlanet = res;
    });

    httpMock.expectNone(`${baseUrl}/planets/1`);
    expect(firstPlanet).toEqual(mockPlanet);
    expect(cachedPlanet).toEqual(mockPlanet);

    let firstFilms: Film[] | undefined;
    let cachedFilms: Film[] | undefined;

    service.getCategoryList('films').subscribe((res) => {
      firstFilms = res;
    });

    const listReq = httpMock.expectOne(`${baseUrl}/films`);
    expect(listReq.request.method).toBe('GET');
    listReq.flush([mockFilm]);

    service.getFilms().subscribe((res) => {
      cachedFilms = res;
    });

    httpMock.expectNone(`${baseUrl}/films`);
    expect(firstFilms).toEqual([mockFilm]);
    expect(cachedFilms).toEqual([mockFilm]);
  });

  it('clearCache() should clear cached URL responses so subsequent calls issue a fresh GET request', () => {
    service.getCategoryItem('planets', 1).subscribe();
    httpMock.expectOne(`${baseUrl}/planets/1`).flush(mockPlanet);

    service.clearCache();

    service.getCategoryItem('planets', 1).subscribe();
    const freshReq = httpMock.expectOne(`${baseUrl}/planets/1`);
    expect(freshReq.request.method).toBe('GET');
    freshReq.flush(mockPlanet);
  });
});
