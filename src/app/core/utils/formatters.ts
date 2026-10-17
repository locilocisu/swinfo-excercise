const NON_NUMERIC_VALUES = new Set(['unknown', 'n/a', 'none', 'indefinite', '']);

/**
 * Formats a raw SWAPI metric string by appending a unit (and optionally formatting
 * numeric values with thousands separators), while preserving non-numeric placeholders
 * like "unknown" or "n/a".
 */
export function formatMetric(
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

/**
 * Converts a numeric episode ID (1-9) into a Roman numeral label (e.g., "Episode IV").
 */
export function formatEpisodeRoman(episodeId: number): string {
  const numerals: Record<number, string> = {
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
  return `Episode ${numerals[episodeId] ?? episodeId}`;
}
