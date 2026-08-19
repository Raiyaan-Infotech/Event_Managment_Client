'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

/**
 * Brand colours and font come from the backend, not from a hardcoded palette.
 *
 *   GET /website-builder/theme-settings
 *
 * The route sits under `optionalCompanyAuth`, so it answers without a session —
 * which matters here, because this panel has no login of its own.
 *
 * The values in `globals.css` are the FALLBACK, not the source of truth. They
 * are what renders for the moment before this request lands (and if it never
 * does), so they are kept in step with the builder's defaults rather than left
 * as whatever the template shipped.
 */
export interface ThemeSettings {
    id: number;
    primary_color: string | null;
    secondary_color: string | null;
    accent_color: string | null;
    background_color: string | null;
    text_color: string | null;
    font_family: string | null;
    border_radius: string | null;
    is_active: number;
}

export function useThemeSettings() {
    return useQuery({
        queryKey: ['theme-settings'],
        queryFn: () => api.get<ThemeSettings>('/website-builder/theme-settings'),
        // The brand does not change mid-session. Refetching it on every screen
        // would be a request per navigation for data that is effectively static.
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        // A missing theme row must not blank the UI — the CSS fallback covers it.
        retry: 1,
    });
}
