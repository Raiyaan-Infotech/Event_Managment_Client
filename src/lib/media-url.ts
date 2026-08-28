/**
 * Resolve a stored media path into something a browser can actually fetch.
 *
 * ── THE PROBLEM THIS SOLVES ─────────────────────────────────────────────────
 * What the API stores in a media column depends on the company's configured
 * storage driver:
 *
 *   s3     https://d1234.cloudfront.net/client-avatars/photo.jpg   absolute
 *   local  /uploads/client-avatars/photo.jpg                        RELATIVE
 *
 * The relative form is relative to the BACKEND. This portal runs on its own
 * origin and calls the backend cross-origin, so `<img src="/uploads/…">`
 * resolves against the portal instead and 404s — the file is served perfectly
 * well, just from a different port. That is exactly how a successful upload
 * appears as a broken image.
 *
 * ── WHY THIS IS FIXED HERE AND NOT IN THE DATABASE ──────────────────────────
 * Rows already written hold relative paths, so a backend change to emit
 * absolute URLs would not repair them — the reader has to cope either way.
 * Doing it at render time also keeps the stored value portable: the same row
 * works from any origin, which is the point of storing it relative.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1').replace(/\/$/, '');

/**
 * The backend's ORIGIN, without the `/api/v1` suffix.
 *
 * Static files are served from the app root (`app.use('/uploads', …)`), not
 * from under the API prefix, so the version segment has to come off or every
 * image 404s at `/api/v1/uploads/…`.
 */
const API_ORIGIN = API_BASE.replace(/\/api\/v\d+$/, '');

/**
 * @returns a fetchable URL, or `undefined` for an empty value — never an empty
 * string. `<img src="">` makes the browser re-request the current page as an
 * image, which is a real request, a console error, and sometimes a visible
 * flash of the page inside its own layout.
 */
export function mediaUrl(value?: string | null): string | undefined {
    const raw = String(value ?? '').trim();
    if (!raw) return undefined;

    // Already absolute (S3/CloudFront), a data URI from a local preview, or a
    // protocol-relative URL. All three are fetchable as they stand.
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
        return raw;
    }

    return `${API_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
}
