import { useEffect } from 'react';
import { useEventOptions } from '@/hooks/use-client-portal';

/**
 * Fonts the admin ADDED for invitation templates (admin → Templates → Fonts).
 *
 * A template names its fonts (`primary_font` / `secondary_font`). The ten the
 * wizard has always offered are ordinary web fonts; an added one is a file the
 * admin uploaded or a link they pasted, and the browser has to be told where
 * it lives or the invitation is drawn in a default face.
 *
 * `/client/event-options` lists them (`fonts`); this declares each one on the
 * page, once.
 */
export interface TemplateRenderFont {
    id: number;
    name: string;
    source: 'upload' | 'link';
    link_url: string | null;
    /** A link is either a stylesheet or a single font file. Null for an upload. */
    link_kind: 'stylesheet' | 'file' | null;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1').replace(/\/$/, '');

/** The public route that serves an uploaded font with the CORS headers a web font needs. */
const fontFileUrl = (id: number) => `${API_URL}/template-fonts/${id}/file`;

export function loadTemplateFonts(fonts: TemplateRenderFont[] | undefined) {
    if (typeof document === 'undefined' || !fonts?.length) return;
    for (const font of fonts) {
        const marker = `template-font-${font.id}`;
        if (document.getElementById(marker)) continue;

        if (font.source === 'link' && font.link_kind === 'stylesheet' && font.link_url) {
            const link = document.createElement('link');
            link.id = marker;
            link.rel = 'stylesheet';
            link.href = font.link_url;
            document.head.appendChild(link);
            continue;
        }

        const src = font.source === 'upload' ? fontFileUrl(font.id) : font.link_url;
        if (!src) continue;
        const style = document.createElement('style');
        style.id = marker;
        // The name is validated server-side to letters, digits, spaces and a
        // few joining marks, so it cannot close the string it is written into.
        style.textContent = `@font-face{font-family:"${font.name}";src:url("${src}");font-display:swap;}`;
        document.head.appendChild(style);
    }
}

/** Declares the added fonts wherever an invitation is drawn. */
export function useTemplateFonts() {
    const options = useEventOptions();
    const fonts = options.data?.fonts;
    const signature = (fonts ?? []).map((f) => f.id).join(',');
    useEffect(() => {
        loadTemplateFonts(fonts);
        // `signature` stands for `fonts`: same ids, same fonts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature]);
}
