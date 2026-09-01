'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

import { useClientSettings } from '@/hooks/use-client-settings';

/**
 * Applies the client's stored theme to next-themes.
 *
 * ── WHY THE PREFERENCE IS NOT SIMPLY next-themes' OWN STORAGE ───────────────
 * next-themes keeps the choice in localStorage, which is per BROWSER. The
 * Preferences screen offers Theme as an account setting, and a client signing
 * in on their laptop and their phone expects the same portal. So the server row
 * is the source of truth and this pushes it into next-themes on load.
 *
 * ── APPLIED ONCE PER ACCOUNT, NOT ON EVERY RENDER ───────────────────────────
 * A plain `if (stored !== theme) setTheme(stored)` fights the user: they toggle
 * the theme somewhere else, this sees a mismatch and puts it straight back
 * before the save lands. Guarded by a ref keyed on the account id — the same
 * "seed once, not on every refetch" fix as §308's Settings form, which silently
 * overwrote what was being typed.
 *
 * The Preferences screen calls `setTheme` itself when the client picks one, so
 * a change is immediate and this only has to cover the arrival.
 */
export function ThemeSync() {
    const { data } = useClientSettings();
    const { setTheme } = useTheme();
    const appliedFor = useRef<number | null>(null);

    const clientId = data?.preferences?.website_client_id ?? null;
    const stored = data?.preferences?.theme;

    useEffect(() => {
        if (!clientId || !stored) return;
        if (appliedFor.current === clientId) return;
        appliedFor.current = clientId;
        setTheme(stored);
    }, [clientId, stored, setTheme]);

    return null;
}
