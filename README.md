# Star Wars Character Datapad

A single-page Angular (v22) and Angular Material application for exploring Star Wars characters and their related attributes, species, homeworlds, film appearances, starships, and vehicles from [`https://swapi.info`](https://swapi.info/).

---

## Getting Started

### Prerequisites
- **Node.js**: v22+ (tested on Node v24)
- **npm**: v10+

### Installation & Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Open your browser at `http://localhost:4200/`.

### Production Build

```bash
npm run build
```

### Running Automated Tests

Run the unit test suite (powered by Vitest and Angular `TestBed`):

```bash
npx ng test --watch=false
```

---

## Assumptions Made

1. **`swapi.info` Unpaginated Array Responses**: Unlike the older `swapi.dev` endpoint (which returned paginated `{ count, next, previous, results }` envelopes), `https://swapi.info/api/*` returns full JSON arrays directly (e.g., all 82 characters at `/api/people` and all 6 films at `/api/films`). Because all 82 characters are returned in a single lightweight payload, client-side sorting and search filtering provide instant, zero-latency feedback.
2. **Empty `species` Array Treated as Human**: A known quirk of the SWAPI dataset (`https://swapi.info/api/people/1`) is that most human characters—including Luke Skywalker, Leia Organa, Han Solo, Darth Vader, and Obi-Wan Kenobi—have an empty `"species": []` array in the API response. Any character with an empty `species` array is treated as **Human** and automatically resolved against `https://swapi.info/api/species/1`, matching the wireframe specification.
3. **Non-Numeric Attribute Values**: SWAPI frequently returns string placeholders such as `"unknown"`, `"n/a"`, `"none"`, or `"indefinite"` for numeric fields (`height`, `mass`, `population`, `diameter`, `surface_water`). The `SwapiMetricPipe` (`swapiMetric`) detects these values so units (`cm`, `kg`, `km`, `%`) and thousands separators are only applied to valid numbers.
4. **Films Timeline Bar**: Following the wireframe mockup, all 6 Star Wars films are displayed in chronological episode order (`Episode I` through `Episode VI`), visually highlighting the films in which the selected character appears and dimming the others (with accessible `aria-label` descriptions for screen readers).
5. **Resource URL Shape & ID Extraction (`extractSwapiId`)**: Related entities in SWAPI are referenced by URL strings (e.g., `"https://swapi.info/api/planets/1"`) rather than embedded IDs. `SwapiService.extractSwapiId()` populates each entity's `id` and normalizes all relational URL fields into IDs under the assumption that SWAPI resource URLs will always retain their `{baseUrl}/{category}/{id}` structure with the entity ID as the final path segment.

---

## Technical Approach & Architecture

The application is structured around clear domain boundaries:

- **`src/app/core/models/swapi.models.ts`**: Strictly typed TypeScript interfaces for all SWAPI resources (`Character`, `Film`, `Planet`, `Species`, `Starship`, `Vehicle`).
- **`src/app/core/services/swapi.service.ts`**: Singleton data-access service encapsulating all HTTP communication with `https://swapi.info/api`, exposing typed category and item endpoints (`getCategoryList`, `getCategoryItem`, `getPeople`, `getFilms`, etc.) backed by an internal `shareReplay(1)` URL cache (`getByUrl`).
- **`src/app/core/pipes/swapi-pipes.ts`**: Pure standalone Angular pipes (`SwapiMetricPipe`, `EpisodeRomanPipe`, and `AurebeshTextPipe`) for formatting metric units, thousands separators, Roman numeral episode labels, and Aurebesh text normalization.
- **`src/app/features/character-datapad/`**: Lazy-loaded standalone component implementing the single-page Character Datapad layout using Angular Signals (`signal`, `computed`, `effect`) and Angular Material components.

---

## Architectural Decisions, Tradeoffs & Alternatives

1. **Angular Signals for State Management vs. NgRx / Heavy Store Libraries**:
   - *Decision*: Used native Angular Signals (`signal`, `computed`, `effect`) inside the feature component paired with a stateless/cached `SwapiService`.
   - *Rationale*: For a single-page datapad view, Signals provide synchronous, glitch-free derived state (`sortedCharacters`, `filteredCharacters`, `selectedCharacter`, `sortedFilms`) without the boilerplate of actions/reducers.
2. **Per-Section Error & Loading Isolation vs. Single `forkJoin` All-or-Nothing Load**:
   - *Decision*: Isolated loading and error states for `Species`, `Homeworld`, `Films`, `Starships`, and `Vehicles`.
   - *Rationale*: If a single starship or planet endpoint fails, the rest of the character's datapad remains usable and only the affected card shows an inline error state with a retry action.
3. **In-Memory Request Caching (`shareReplay`) vs. Repeated Network Calls**:
   - *Decision*: Cached all category list and item requests in `SwapiService` through its internal `getByUrl()` cache with automatic cache eviction on error.
   - *Rationale*: Many characters share the same homeworld (e.g., Tatooine, Naboo), species, or vehicles. Caching eliminates redundant network requests as the user clicks through characters while still allowing failed requests to be retried.
4. **Service-Boundary ID Normalization vs. Exposing Raw SWAPI URLs**:
   - *Decision*: `SwapiService` normalizes all incoming API responses at the service boundary (`normalizeEntity()`) before caching with `shareReplay(1)`, populating an `id` property on each resource and converting relational URL strings (`homeworld`, `films`, `species`, `starships`, `vehicles`, `characters`, `planets`, `residents`, `people`, `pilots`) into plain IDs.
   - *Rationale*: Acts as an anti-corruption layer so feature components work with clean, ID-based domain models (`getCategoryItem('planets', character.homeworld)`) without needing to understand SWAPI's hypermedia URL structure. Normalizing before `shareReplay(1)` also reduces the in-memory cache footprint (storing short ID strings instead of repeated full URL strings) and avoids re-normalizing on cache hits.

---

## Technical Risks & Limitations

- **Client-Side Filtering Scale**: Fetching all characters at once works well for SWAPI's 82 records, but would not scale to tens of thousands of records without server-side pagination/search and virtual scrolling (`@angular/cdk/scrolling`).
- **Unbounded Session Cache**: The in-memory `Map` in `SwapiService` is bounded in practice by the small total size of SWAPI (~200 total URLs), but in a larger API it would require an LRU eviction policy or TTL expiration.
- **Third-Party API Availability**: The app depends directly on `https://swapi.info/api` without a backend proxy or offline service worker cache.

---

## Prioritized Future Improvements

1. **URL Query Parameter Sync (`?character=1&q=...`)**: Sync the selected character ID and search filter with the router query parameters so users can bookmark or share deep links to a specific character.
2. **Keyboard Arrow Navigation & Virtual Scrolling**: Add up/down arrow key navigation in the character listbox and CDK virtual scrolling for larger datasets.
3. **Cross-Entity Navigation**: Allow clicking a film, homeworld, starship, or vehicle to view its dedicated detail modal or route.
4. **End-to-End (Playwright) & Accessibility (axe-core) CI Checks**: Add automated E2E and WCAG AA axe-core checks in CI.

---

## Use and Validation of AI-Assisted Tools

AI-assisted tooling was used to accelerate project scaffolding, inspect the `https://swapi.info/api` response schemas, generate initial TypeScript interfaces and unit test scaffolding, and align the CSS Grid/Container Query layout with the provided wireframe. All generated code was reviewed and validated by:
- Inspecting live responses from `https://swapi.info/api` to verify field types and edge cases (such as empty `species` arrays and `"unknown"`/`"n/a"` string metrics).
- **Testing**: Running automated unit tests (`ng test --watch=false`) covering `SwapiService`, `SwapiMetricPipe`/`EpisodeRomanPipe`, and `CharacterDatapad` state transitions (loading, search filtering, empty states, and error recovery).
- Verifying production compilation (`npm run build`) with strict TypeScript checking enabled.
- Reviewing all AI generated code and making tweaks. For example, AI initially implemented the EpisodeRomanPipe and SwapiMetricPipe as a utility class. Author considers Angular Pipe implementation is more streamline and maintainable.

---

## Guidance for Maintaining & Extending the Application

- **Adding New SWAPI Categories or Fields**: Extend the interfaces in `src/app/core/models/swapi.models.ts` and use `SwapiService.getCategoryList()` or `SwapiService.getCategoryItem()` to resolve entities with automatic caching.
- **Formatting API Values**: Always pass raw numeric strings from SWAPI through the `swapiMetric` pipe (`src/app/core/pipes/swapi-pipes.ts`) rather than interpolating units directly in templates, as SWAPI frequently returns `"unknown"` or `"n/a"`.
- **Testing Changes**: Add corresponding test cases in `*.spec.ts` using `HttpTestingController` for service tests and mocked `SwapiService` observables for component behavior tests.
