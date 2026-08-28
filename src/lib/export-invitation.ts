import { toPng, toSvg } from 'html-to-image';
import { api } from '@/lib/api-client';

/**
 * Downloads a rendered invitation card as a PNG or SVG file.
 *
 * ── WHY IMAGES ARE INLINED FIRST ─────────────────────────────────────────────
 * The storage bucket sends no `Access-Control-Allow-Origin`. Both `toPng` (via
 * an internal `<canvas>`) and `toSvg` (which embeds each image as a data URI)
 * have to READ the pixels of every image on the card, and a cross-origin image
 * with no CORS header cannot be read back out — the canvas is "tainted" and
 * `toDataURL()`/`toBlob()` throw a SecurityError, while `toSvg`'s own
 * fetch-and-inline gets an opaque response it cannot embed. The invitation's
 * frame and decorations are exactly such images.
 *
 * The SERVER has no such restriction, so `GET /client/media/proxy` fetches the
 * file and hands it back as a base64 data URI. Every `<img src>` and inline
 * `background-image` under the captured node is swapped to its data URI before
 * the snapshot and swapped BACK afterwards — a capture-time trick, not a real
 * change to what the page is showing.
 *
 * ── WHAT "SVG" ACTUALLY MEANS HERE ───────────────────────────────────────────
 * `toSvg` wraps the card's live DOM in a `<foreignObject>` inside an `<svg>` —
 * a real, openable SVG, but the text stays HTML rather than becoming `<text>`
 * paths. That is `html-to-image`'s own format, not a limitation added here.
 *
 * Ported from the admin panel's `lib/export-invitation-png.ts`. The two are
 * separate repos and the only difference is which proxy endpoint they call —
 * the admin's sits behind the admin token, this one behind the client session.
 */

export type ExportFormat = 'png' | 'svg';

const URL_IN_CSS = /url\((['"]?)(.*?)\1\)/;

/** Every element whose background-image is a `url(...)` this can rewrite. */
function backgroundImageElements(root: HTMLElement): HTMLElement[] {
    const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
    return all.filter((el) => URL_IN_CSS.test(el.style.backgroundImage || ''));
}

/** Resolves once every `<img>` under `root` has loaded (or failed). */
function waitForImages(root: HTMLElement): Promise<void[]> {
    const imgs = Array.from(root.querySelectorAll('img'));
    return Promise.all(
        imgs.map(
            (img) =>
                new Promise<void>((resolve) => {
                    if (img.complete) return resolve();
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                })
        )
    );
}

/**
 * Fetches one file through the server and returns it as a data URI.
 *
 * Data URIs and same-origin assets are returned as-is — there is nothing
 * external to inline, and sending them through the proxy would be a round trip
 * to be told what we already know.
 */
async function toDataUri(url: string, cache: Map<string, string>): Promise<string> {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cached = cache.get(url);
    if (cached) return cached;

    try {
        const result = await api.get<{ dataUri?: string }>('/client/media/proxy', { url });
        const dataUri = result?.dataUri ?? url;
        cache.set(url, dataUri);
        return dataUri;
    } catch {
        // Best-effort: leave the original URL rather than failing the whole
        // export over one broken asset (a deleted file, a stale link). The
        // download then loses that one image instead of producing nothing.
        return url;
    }
}

/** Swaps external images under `node` to data URIs, captures, restores the DOM. */
async function withInlinedImages<T>(node: HTMLElement, capture: () => Promise<T>): Promise<T> {
    const cache = new Map<string, string>();
    const imgs = Array.from(node.querySelectorAll('img'));
    const bgEls = backgroundImageElements(node);

    const originalImgSrc = new Map<HTMLImageElement, string>();
    const originalBg = new Map<HTMLElement, string>();

    try {
        await Promise.all([
            ...imgs.map(async (img) => {
                originalImgSrc.set(img, img.src);
                img.src = await toDataUri(img.src, cache);
            }),
            ...bgEls.map(async (el) => {
                const original = el.style.backgroundImage;
                originalBg.set(el, original);
                const match = URL_IN_CSS.exec(original);
                if (!match) return;
                const inlined = await toDataUri(match[2], cache);
                el.style.backgroundImage = original.replace(match[2], inlined);
            }),
        ]);

        // The swapped `<img>` sources have only just started loading again.
        await waitForImages(node);

        return await capture();
    } finally {
        // Restored even if the capture threw partway through, or the card the
        // user is still looking at would be left holding data URIs.
        for (const [img, src] of originalImgSrc) img.src = src;
        for (const [el, bg] of originalBg) el.style.backgroundImage = bg;
    }
}

function triggerDownload(href: string, filename: string) {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

/** A filename-safe slug. Falls back rather than producing an empty name. */
export function fileSlug(value: string | null | undefined, fallback = 'invitation'): string {
    const slug = String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug || fallback;
}

/**
 * Captures `node` as a PNG or SVG and starts a browser download.
 *
 * `baseName` is used WITHOUT an extension — the right one is appended for the
 * format actually requested, so a caller cannot hand in `invitation.png` and
 * get `invitation.png.svg` out the other end.
 */
export async function downloadNodeAsImage(
    node: HTMLElement,
    baseName: string,
    format: ExportFormat = 'png',
    options: { pixelRatio?: number } = {}
): Promise<void> {
    const name = baseName.replace(/\.(png|svg)$/i, '');

    await withInlinedImages(node, async () => {
        const dataUrl =
            format === 'svg'
                ? await toSvg(node, { cacheBust: true })
                // 3x, so the card is usable in print rather than only on screen.
                : await toPng(node, { pixelRatio: options.pixelRatio ?? 3, cacheBust: true });

        triggerDownload(dataUrl, `${name}.${format}`);
    });
}

/**
 * Downloads the QR code on its own, as a PNG.
 *
 * `qrcode.react` renders either a `<canvas>` or an `<svg>` depending on how it
 * was mounted, so both are handled: a canvas can be read directly, and an SVG
 * is serialised and drawn onto one. Nothing here goes through the proxy — the
 * QR is generated in the browser and has no external asset to taint it.
 *
 * Padded with a white quiet zone. A QR flush to its own edge scans poorly, and
 * a transparent PNG dropped on dark stationery does not scan at all.
 */
export async function downloadQrAsPng(
    container: HTMLElement,
    baseName: string,
    size = 900
): Promise<void> {
    const name = baseName.replace(/\.png$/i, '');
    const canvasEl = container.querySelector('canvas');
    const svgEl = container.querySelector('svg');

    const out = document.createElement('canvas');
    out.width = size;
    out.height = size;
    const ctx = out.getContext('2d');
    if (!ctx) throw new Error('Your browser could not render the QR code.');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const quiet = Math.round(size * 0.08);
    const inner = size - quiet * 2;

    if (canvasEl) {
        ctx.imageSmoothingEnabled = false; // keep the modules crisp when scaling up
        ctx.drawImage(canvasEl, quiet, quiet, inner, inner);
    } else if (svgEl) {
        const xml = new XMLSerializer().serializeToString(svgEl);
        const url = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(xml)))}`;
        await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => { ctx.drawImage(img, quiet, quiet, inner, inner); resolve(); };
            img.onerror = () => reject(new Error('Could not read the QR code image.'));
            img.src = url;
        });
    } else {
        throw new Error('No QR code has been generated for this event yet.');
    }

    triggerDownload(out.toDataURL('image/png'), `${name}-qr.png`);
}

/**
 * Downloads the QR code on its own, as a real vector SVG.
 *
 * ── WHY IT LOOKS FOR A MARKED ELEMENT ────────────────────────────────────────
 * A bare `querySelector('svg')` is wrong here: the container is the whole QR
 * card, and every Font Awesome icon on it is an `<svg>` too — the first match
 * would be a download arrow, serialised and handed over as "your QR code".
 * `EventQr` marks its export source with `data-qr-svg`, and the loose lookup is
 * only a fallback for a container that holds nothing else.
 *
 * Vector rather than a PNG wrapped in an `<svg>`: the whole point of asking for
 * SVG is printing at a size nobody has chosen yet, and a raster inside a vector
 * wrapper blurs exactly the same way at exactly the same size.
 *
 * The quiet zone is already in the markup — `qrcode.react` draws its own
 * background rect and honours `marginSize`, so nothing has to be composited
 * here the way the PNG path composites onto a canvas.
 */
export function downloadQrAsSvg(
    container: HTMLElement,
    baseName: string,
    size = 900
): void {
    const name = baseName.replace(/\.svg$/i, '');
    const source =
        container.querySelector<SVGElement>('[data-qr-svg] svg') ??
        container.querySelector<SVGElement>('svg');
    if (!source) throw new Error('No QR code has been generated for this event yet.');

    // Cloned, so setting an export size cannot resize what is on screen.
    const clone = source.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(size));
    clone.setAttribute('height', String(size));

    const xml = new XMLSerializer().serializeToString(clone);
    // encodeURIComponent, not btoa: the markup is ASCII today, but base64 of a
    // non-ASCII string throws, and that would surface as a broken download
    // rather than an error anyone could read.
    triggerDownload(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`,
        `${name}-qr.svg`
    );
}
