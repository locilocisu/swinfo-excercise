import { Pipe, PipeTransform } from '@angular/core';

const NON_NUMERIC_VALUES = new Set(['unknown', 'n/a', 'none', 'indefinite', '']);

/**
 * Formats a raw SWAPI metric string by appending a unit (and optionally formatting
 * numeric values with thousands separators), while preserving non-numeric placeholders
 * like "unknown" or "n/a".
 *
 * Usage:
 *   {{ character.height | swapiMetric:'cm' }}
 *   {{ planet.population | swapiMetric:'':true }}
 *   {{ planet.diameter | swapiMetric:'km':true }}
 */
@Pipe({
  name: 'swapiMetric',
})
export class SwapiMetricPipe implements PipeTransform {
  transform(
    value: string | undefined | null,
    unit = '',
    useThousandsSeparator = false,
  ): string {
    if (value === undefined || value === null) {
      return 'unknown';
    }

    const trimmed = value.trim();
    if (NON_NUMERIC_VALUES.has(trimmed.toLowerCase())) {
      return trimmed || 'unknown';
    }

    const normalizedNumber = Number(trimmed.replace(/,/g, ''));
    const formattedValue =
      useThousandsSeparator && !Number.isNaN(normalizedNumber)
        ? normalizedNumber.toLocaleString('en-US')
        : trimmed;

    if (!unit) {
      return formattedValue;
    }

    return unit === '%' ? `${formattedValue}%` : `${formattedValue} ${unit}`;
  }
}

/**
 * Converts a numeric episode ID (1-9) into a Roman numeral label (e.g., "Episode IV").
 *
 * Usage:
 *   {{ film.episode_id | episodeRoman }}
 */
@Pipe({
  name: 'episodeRoman',
})
export class EpisodeRomanPipe implements PipeTransform {
  private static readonly NUMERALS: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
  };

  transform(episodeId: number | undefined | null): string {
    if (episodeId === undefined || episodeId === null) {
      return '';
    }
    return `Episode ${EpisodeRomanPipe.NUMERALS[episodeId] ?? episodeId}`;
  }
}

/**
 * Normalizes text for Aurebesh font rendering by stripping diacritical marks
 * (e.g., "Padmé Amidala" -> "Padme Amidala", "Dormé" -> "Dorme") so accented
 * characters render as their un-accented base letters instead of missing glyph boxes.
 *
 * Usage:
 *   {{ character.name | aurebeshText }}
 */
@Pipe({
  name: 'aurebeshText',
})
export class AurebeshTextPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return '';
    }

    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
