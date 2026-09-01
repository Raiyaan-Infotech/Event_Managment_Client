'use client';

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api, ApiError } from '@/lib/api-client';
import {
    DEFAULT_FORMAT_PREFS, formatDate as formatWith, type FormatPrefs,
} from '@/lib/format';

/**
 * The client's own Settings — preferences and notification choices.
 *
 * ── ONE REQUEST, ONE SHAPE ──────────────────────────────────────────────────
 * `GET /client/settings` returns the stored values, the notification CATALOGUE,
 * the allowed values for every dropdown, which preferences actually do anything
 * yet, and whether either channel can deliver. Both writes answer with that
 * same shape, so a save REPLACES the cache instead of being merged into it —
 * merging is where §308's "a refetch mid-edit overwrote what was being typed"
 * came from.
 *
 * ── THE CATALOGUE IS NOT DUPLICATED HERE ────────────────────────────────────
 * No list of notification types is typed into this file or into the screens.
 * The server owns it, because the server is what validates against it; a copy
 * in the UI drifts and the failure is silent — the toggle saves nothing and
 * still looks saved.
 */

export interface NotificationType {
    type: string;
    label: string;
    description: string;
    enabled: boolean;
    /** Email only. */
    frequency?: string;
    frequencies?: { value: string; label: string }[];
    /** In-app only. */
    sound?: boolean;
    /** True once the client has actually chosen, rather than sitting on a default. */
    is_set: boolean;
}

export interface NotificationGroup {
    group: string;
    types: NotificationType[];
}

export interface ClientPreferences {
    id: number;
    website_client_id: number;
    language_code: string;
    date_format: string;
    time_zone: string;
    theme: 'light' | 'dark' | 'system';
    default_landing: string;
    items_per_page: number;
    compact_mode: boolean | number;
    auto_save: boolean | number;
    show_tips: boolean | number;
    emails_disabled: boolean | number;
    in_app_disabled: boolean | number;
    dnd_starts_at: string | null;
    dnd_ends_at: string | null;
}

export interface Option { value: string | number; label: string; path?: string }

export interface DeliveryChannel { enabled: boolean; reason: string | null }

export interface ClientSettings {
    preferences: ClientPreferences;
    notifications: { email: NotificationGroup[]; in_app: NotificationGroup[] };
    options: Record<string, Option[]>;
    /** Which preferences change something today. Data, not a hardcoded list. */
    applied: Record<string, boolean>;
    /**
     * What a brand-new row gets, read off the model's column defaults on the
     * server. "Reset to Defaults" uses these so a reset and a new account land
     * in the same place; a copy in the UI would drift from the schema.
     */
    defaults: Partial<ClientPreferences>;
    delivery: { email: DeliveryChannel; in_app: DeliveryChannel };
    dnd_active: boolean;
}

const KEY = ['client', 'settings'] as const;

export function useClientSettings() {
    return useQuery({
        queryKey: KEY,
        queryFn: () => api.get<ClientSettings>('/client/settings'),
        // Settings change only when this person changes them, and every write
        // puts the new state straight into the cache below.
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useUpdatePreferences() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<ClientPreferences>) =>
            api.put<ClientSettings>('/client/settings/preferences', body),
        onSuccess: (settings) => {
            qc.setQueryData(KEY, settings);
            toast.success('Preferences saved');
        },
        // The server's own wording — it names the field and the value it
        // refused, which a generic message cannot.
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'Could not save your preferences.'),
    });
}

export interface NotificationPatch {
    channel: 'email' | 'in_app';
    type: string;
    enabled?: boolean;
    frequency?: string;
    sound?: boolean;
}

/**
 * Notification choices, saved as a BATCH.
 *
 * A request per switch on a screen with sixteen of them is sixteen chances to
 * end up half-saved, and sixteen toasts.
 */
export function useUpdateNotifications() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (items: NotificationPatch[]) =>
            api.put<ClientSettings>('/client/settings/notifications', { items }),
        onSuccess: (settings) => {
            qc.setQueryData(KEY, settings);
            toast.success('Notification settings saved');
        },
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'Could not save your notification settings.'),
    });
}

/**
 * The date formatter every screen should use.
 *
 * ── WHY A HOOK AND NOT A BARE FUNCTION ──────────────────────────────────────
 * The format and the time zone are the CLIENT'S, so they have to be read from
 * their settings. This shares the one cached query — it does not fetch per
 * call site — and falls back to the defaults while that query is in flight, so
 * a date never renders as a flash of "—" before settling.
 *
 * Usage:  const fmt = useDateFormatter();  fmt(row.created_at)
 *         fmt(row.created_at, true)   // with the time
 */
export function useDateFormatter() {
    const { data } = useClientSettings();

    const prefs: FormatPrefs = useMemo(() => ({
        date_format: data?.preferences?.date_format ?? DEFAULT_FORMAT_PREFS.date_format,
        time_zone: data?.preferences?.time_zone ?? DEFAULT_FORMAT_PREFS.time_zone,
    }), [data?.preferences?.date_format, data?.preferences?.time_zone]);

    return useCallback(
        (value: string | number | Date | null | undefined, withTime = false) =>
            formatWith(value, prefs, withTime),
        [prefs],
    );
}
