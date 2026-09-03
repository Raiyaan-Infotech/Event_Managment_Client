'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError, type ListResult } from '@/lib/api-client';

/**
 * Splash Screens — `/api/v1/client/splash-screens`.
 *
 * ── ⚠ NOT TIED TO AN EVENT YET, DELIBERATELY ────────────────────────────────
 * `event_name` is a plain text field the client types, not a picker over
 * their real events. This module ships its own CRUD first; linking a saved
 * splash to a real event is an explicitly later phase — see the backend
 * model header for the full reasoning.
 *
 * ── WHAT THIS ACTUALLY IS ────────────────────────────────────────────────────
 * The MOBILE APP's own splash/loading screen, shown when a guest opens an
 * event inside Event Invite — not a web page. There is nothing here that
 * renders to a guest today.
 *
 * ── background_config etc. ARE FREE-FORM OBJECTS ────────────────────────────
 * `background_type` picks one of six shapes; the fields that go with it live
 * in `background_config`, typed loosely (`Record<string, unknown>`) because
 * each shape is genuinely different and a single interface would be mostly
 * optional fields nobody reads for five of the six types. The FORM narrows
 * these with its own per-type interfaces — see splash-form.tsx.
 */

const ENDPOINT = '/client/splash-screens';
const KEY = ['client', 'splash-screens'] as const;

export type BackgroundType = 'image' | 'video' | 'solid_color' | 'gradient' | 'logo' | 'couple_photo';
export type ButtonStyle = 'filled' | 'outline' | 'text';
export type SplashStatus = 'draft' | 'active';

export interface SplashScreen {
    id: number;
    name: string;
    main_title: string;
    sub_title: string | null;
    event_name: string;
    tagline: string | null;

    background_type: BackgroundType;
    background_url: string | null;
    fallback_image_url: string | null;
    background_config: Record<string, unknown> | null;

    sound_enabled: boolean;
    sound_url: string | null;
    sound_config: { auto_play?: boolean; loop?: boolean; volume?: number } | null;

    loader_enabled: boolean;
    loader_config: { style?: string; color?: string; size?: number; background_color?: string } | null;

    /** ⚠ Saved, not delivered — the app has nowhere to read this yet. */
    animation_enabled: boolean;
    animation_config: {
        style?: string; speed?: string; density?: number;
        overlay_color?: string; overlay_opacity?: number; loop?: boolean;
    } | null;

    button_text: string;
    button_style: ButtonStyle;
    button_color: string | null;

    show_couple_name: boolean;
    show_event_date: boolean;
    show_tagline: boolean;

    status: SplashStatus;
    created_at: string;
    updated_at: string;
}

export type SplashScreenPayload = Omit<SplashScreen, 'id' | 'created_at' | 'updated_at'>;

function reportError(error: unknown, verb: string) {
    if (error instanceof ApiError && error.isAuthError) {
        toast.error('Your session has expired. Please sign in again.');
        return;
    }
    toast.error(error instanceof Error ? error.message : `Failed to ${verb} splash screen`);
}

export function useSplashScreens(params: { search?: string; page?: number; limit?: number } = {}) {
    return useQuery({
        queryKey: [...KEY, 'list', params],
        queryFn: (): Promise<ListResult<SplashScreen>> =>
            api.getList<SplashScreen>(ENDPOINT, {
                search: params.search || undefined,
                page: params.page ?? 1,
                limit: params.limit ?? 12,
            }),
        retry: false,
    });
}

export function useSplashScreen(id: number | undefined) {
    return useQuery({
        queryKey: [...KEY, id],
        queryFn: () =>
            api.get<{ splash_screen: SplashScreen }>(`${ENDPOINT}/${id}`).then((r) => r.splash_screen),
        enabled: !!id,
        retry: false,
    });
}

export function useCreateSplashScreen(onDone?: (splash: SplashScreen) => void) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<SplashScreenPayload>) =>
            api.post<{ splash_screen: SplashScreen }>(ENDPOINT, data).then((r) => r.splash_screen),
        onSuccess: (splash) => {
            toast.success('Splash screen created successfully');
            qc.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            onDone?.(splash);
        },
        onError: (e) => reportError(e, 'create'),
    });
}

export function useUpdateSplashScreen(onDone?: (splash: SplashScreen) => void) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SplashScreenPayload> }) =>
            api.put<{ splash_screen: SplashScreen }>(`${ENDPOINT}/${id}`, data).then((r) => r.splash_screen),
        onSuccess: (splash) => {
            toast.success('Splash screen updated successfully');
            qc.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            onDone?.(splash);
        },
        onError: (e) => reportError(e, 'update'),
    });
}

export function useDeleteSplashScreen() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.del(`${ENDPOINT}/${id}`),
        onSuccess: () => {
            toast.success('Splash screen deleted');
            qc.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
        },
        onError: (e) => reportError(e, 'delete'),
    });
}

/**
 * Upload one file (image/video/audio) and get back its URL.
 *
 * Fires the moment a file is picked, independent of the rest of the form —
 * same shape as the avatar uploader. `onSuccess` is per-call (passed at
 * `.mutate(file, { onSuccess })`) rather than fixed here, because the form
 * uses this ONE hook for five different fields (background, fallback image,
 * logo, couple photo, sound) and each has to know which of ITS OWN fields to
 * write the returned URL into.
 */
export function useUploadSplashMedia() {
    return useMutation({
        mutationFn: (file: File) => {
            const form = new FormData();
            form.append('file', file);
            return api.post<{ url: string }>(`${ENDPOINT}/media`, form).then((r) => r.url);
        },
        onError: (e) => reportError(e, 'upload'),
    });
}
