import { useMemo, type CSSProperties } from 'react';
import QRCode from 'qrcode';

/**
 * How the host chose to draw the event's QR (`events.qr_style`), picked on the
 * mobile app's Invitation Card → Settings. Same three styles as the app's
 * `EventQr` widget, so a code looks the same on the phone and in the portal:
 *   0 classic — square modules
 *   1 rounded — round modules and round finder eyes
 *   2 heart   — classic, with a heart in the middle
 */
export type QrStyle = 0 | 1 | 2;

export type QrLevel = 'L' | 'M' | 'Q' | 'H';

export function toQrStyle(value: unknown): QrStyle {
    const n = Number(value);
    return n === 1 || n === 2 ? n : 0;
}

/**
 * The heart covers ~3% of the code, so it needs error correction M at least;
 * the plain styles keep whatever the caller chose.
 */
function levelFor(style: QrStyle, level: QrLevel): QrLevel {
    return style === 2 && level === 'L' ? 'M' : level;
}

const HEART_PATH =
    'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

interface StyledQrSvgProps {
    value: string;
    /** Rendered size in CSS pixels; ignored when `style` sets width/height. */
    size?: number;
    qrStyle?: QrStyle;
    level?: QrLevel;
    /** Quiet zone, in modules. Drawn inside the code so it scales with it. */
    marginSize?: number;
    style?: CSSProperties;
}

/**
 * A QR code as a single vector `<svg>`, black on white regardless of theme —
 * an inverted or tinted code is rejected by most scanners.
 */
export function StyledQrSvg({
    value,
    size = 180,
    qrStyle = 0,
    level = 'M',
    marginSize = 2,
    style,
}: StyledQrSvgProps) {
    const shape = useMemo(() => {
        const qr = QRCode.create(value, { errorCorrectionLevel: levelFor(qrStyle, level) });
        const n = qr.modules.size;
        const on = (r: number, c: number) => qr.modules.get(r, c) === 1;

        // The three 7x7 finder eyes. Drawn as their own shapes so the rounded
        // style can round them; their modules are skipped in the data pass.
        const eyes: [number, number][] = [[0, 0], [0, n - 7], [n - 7, 0]];
        const inEye = (r: number, c: number) =>
            eyes.some(([er, ec]) => r >= er && r < er + 7 && c >= ec && c < ec + 7);

        let squares = '';
        const dots: [number, number][] = [];
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (!on(r, c) || inEye(r, c)) continue;
                if (qrStyle === 1) dots.push([c + marginSize, r + marginSize]);
                else squares += `M${c + marginSize} ${r + marginSize}h1v1h-1z`;
            }
        }
        return { n, total: n + marginSize * 2, eyes, squares, dots };
    }, [value, qrStyle, level, marginSize]);

    const { total, eyes, squares, dots } = shape;
    const mid = total / 2;
    const badge = total * 0.18;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${total} ${total}`}
            width={size}
            height={size}
            shapeRendering={qrStyle === 1 ? 'geometricPrecision' : 'crispEdges'}
            style={style}
        >
            <rect width={total} height={total} fill="#ffffff" />
            {squares && <path d={squares} fill="#000000" />}
            {dots.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.5} fill="#000000" />
            ))}
            {eyes.map(([er, ec]) => {
                const x = ec + marginSize;
                const y = er + marginSize;
                return qrStyle === 1 ? (
                    <g key={`${er}-${ec}`}>
                        <circle cx={x + 3.5} cy={y + 3.5} r={3} fill="none" stroke="#000000" strokeWidth={1} />
                        <circle cx={x + 3.5} cy={y + 3.5} r={1.5} fill="#000000" />
                    </g>
                ) : (
                    <path
                        key={`${er}-${ec}`}
                        fill="#000000"
                        fillRule="evenodd"
                        d={`M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z M${x + 2} ${y + 2}h3v3h-3z`}
                    />
                );
            })}
            {qrStyle === 2 && (
                <g>
                    <circle cx={mid} cy={mid} r={badge / 2} fill="#ffffff" />
                    <path
                        d={HEART_PATH}
                        fill="#E53935"
                        transform={`translate(${mid - badge * 0.36} ${mid - badge * 0.36}) scale(${(badge * 0.72) / 24})`}
                    />
                </g>
            )}
        </svg>
    );
}
