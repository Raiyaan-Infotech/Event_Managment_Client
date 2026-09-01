/**
 * One place that turns a timestamp into text.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * Before it, nine files each had their own `formatDate`, every one of them
 * hardcoding a locale and the browser's own time zone. The Preferences screen
 * offers "Date Format" and "Time Zone", and a preference that changes nothing
 * is exactly what this codebase keeps refusing to ship — so the setting had to
 * have somewhere to land.
 *
 * ── WHY NOT toLocaleDateString WITH A LOCALE ────────────────────────────────
 * The client picks a FORMAT ("DD/MM/YYYY"), not a locale. Mapping a format back
 * onto a locale that happens to render that way ('en-GB' for DD/MM) works until
 * somebody picks "YYYY-MM-DD", which no common locale produces, and it silently
 * gives them something else. The parts are read from Intl and assembled here,
 * so what is chosen is what is rendered.
 *
 * The TIME ZONE is still handed to Intl, because converting an instant into a
 * wall clock is genuinely hard (DST) and Intl already does it correctly.
 */

export type DateFormat =
    | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD MMM YYYY' | 'MMM DD, YYYY';

export interface FormatPrefs {
    date_format: string;
    time_zone: string;
}

export const DEFAULT_FORMAT_PREFS: FormatPrefs = {
    date_format: 'DD/MM/YYYY',
    time_zone: 'Asia/Kolkata',
};

/** Intl parts, keyed, so assembling a format is a lookup and not a regex. */
function parts(date: Date, timeZone: string, month: 'short' | '2-digit') {
    let formatter: Intl.DateTimeFormat;
    try {
        formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone, year: 'numeric', month, day: '2-digit',
        });
    } catch {
        /*
          An unknown time zone throws a RangeError. A stored value can go stale
          (a zone is renamed, or a row predates a validation change), and a date
          that throws would take the whole page down — so it falls back to the
          browser's own zone rather than to nothing.
        */
        formatter = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month, day: '2-digit' });
    }
    const found: Record<string, string> = {};
    for (const p of formatter.formatToParts(date)) found[p.type] = p.value;
    return found;
}

function timeIn(date: Date, timeZone: string) {
    try {
        return new Intl.DateTimeFormat('en-GB', {
            timeZone, hour: '2-digit', minute: '2-digit', hour12: true,
        }).format(date);
    } catch {
        return new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit', minute: '2-digit', hour12: true,
        }).format(date);
    }
}

/**
 * `value` may be null/undefined/unparseable — every caller here reads dates off
 * API rows, and an em dash is the right answer for a date that is not set.
 */
export function formatDate(
    value: string | number | Date | null | undefined,
    prefs: FormatPrefs = DEFAULT_FORMAT_PREFS,
    withTime = false,
): string {
    if (value === null || value === undefined || value === '') return '—';

    const wantsShortMonth = prefs.date_format === 'DD MMM YYYY' || prefs.date_format === 'MMM DD, YYYY';
    const zone = prefs.time_zone || DEFAULT_FORMAT_PREFS.time_zone;

    /*
      ⚠ A BARE `YYYY-MM-DD` IS A CALENDAR DATE, NOT AN INSTANT, AND MUST NOT BE
      CONVERTED.

      `new Date('2025-05-25')` parses as UTC midnight. Rendering that through a
      zone west of UTC moves it to the 24th — an event date showing the day
      before itself. Several files in this portal carry a comment warning about
      exactly this, and formatting every value through Intl would have walked
      straight back into it: it looks correct in Asia/Kolkata (+05:30, which
      lands the same day) and is wrong for anyone in the Americas.

      So a date-only string is split, never parsed into an instant.
    */
    const dateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
    if (dateOnly) {
        const [y, m, d] = value.trim().split('-');
        const monthText = wantsShortMonth ? SHORT_MONTHS[Number(m) - 1] ?? m : m;
        return assemble(prefs.date_format, d, monthText, y);
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    const { day, month, year } = parts(date, zone, wantsShortMonth ? 'short' : '2-digit');

    const out = assemble(prefs.date_format, day, month, year);
    return withTime ? `${out}, ${timeIn(date, zone)}` : out;
}

const SHORT_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** The chosen layout, given the three pieces. One place, so both paths agree. */
function assemble(format: string, day: string, month: string, year: string): string {
    switch (format) {
        case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
        case 'DD MMM YYYY': return `${day} ${month} ${year}`;
        case 'MMM DD, YYYY': return `${month} ${day}, ${year}`;
        case 'DD/MM/YYYY':
        default: return `${day}/${month}/${year}`;
    }
}

/**
 * The zones offered on the Preferences screen.
 *
 * `Intl.supportedValuesOf` is the browser's own list — a real one, rather than
 * a hand-typed selection that goes stale. It is not in every engine, so the
 * fallback is a short list that at least covers where this product is used;
 * a zone the browser cannot resolve is handled at format time above.
 */
export function supportedTimeZones(): string[] {
    try {
        const supported = (Intl as unknown as {
            supportedValuesOf?: (key: string) => string[];
        }).supportedValuesOf?.('timeZone');
        if (supported?.length) return supported;
    } catch { /* older engine */ }
    return [
        'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London',
        'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'UTC',
    ];
}

/** The zone the browser is actually in, offered as the obvious first choice. */
export function browserTimeZone(): string | null {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
        return null;
    }
}
