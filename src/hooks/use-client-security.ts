'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api, ApiError } from '@/lib/api-client';

/**
 * Security — active sessions, authorized devices and two-factor authentication.
 *
 * ── THESE ARE REAL NOW, AND THEY WERE NOT BEFORE ────────────────────────────
 * The Security tab used to say sessions and 2FA were impossible rather than
 * merely unbuilt, and that was accurate: sign-in issued a stateless JWT with no
 * server-side record, so there was nothing to list and nothing to revoke. A
 * `client_sessions` row is now written for every sign-in, keyed on the refresh
 * token's own `jti`, so "Log Out" on another device genuinely ends it.
 *
 * ── SESSIONS AND DEVICES ARE ONE THING ──────────────────────────────────────
 * Both screens read the same rows; the server serves them under two names
 * because the two screens ask different questions of them. There is no second
 * list to keep in step.
 *
 * ── ⚠ WHAT THE SERVER SAYS IT CANNOT DO ─────────────────────────────────────
 * `location_available` comes back false and every `location` is null: no
 * IP-location service is connected. The screens print the IP instead of a city,
 * and read that flag rather than hardcoding the assumption — the day a lookup is
 * added they start showing it without anybody editing a component.
 */

export interface ClientSession {
    id: number;
    is_current: boolean;
    transport: 'web' | 'app';
    device_name: string;
    device_type: string | null;
    browser: string | null;
    os: string | null;
    ip_address: string | null;
    /** ⚠ Always null today — see the header. */
    location: string | null;
    last_active_at: string;
    created_at: string;
    expires_at: string;
    is_trusted: boolean;
    trusted_until: string | null;
}

export interface SessionList {
    sessions: ClientSession[];
    current_session_id: number | null;
    location_available: boolean;
    location_note: string;
}

export interface DeviceList {
    devices: ClientSession[];
    location_available: boolean;
}

export interface TwoFactorStatus {
    is_enabled: boolean;
    /** A secret exists but was never confirmed — offer "finish setting up". */
    is_pending: boolean;
    confirmed_at: string | null;
    last_used_at: string | null;
    backup_codes_remaining: number;
    /** Stated by the API so this stops claiming the app is uncovered the day it isn't. */
    covers: { web_sign_in: boolean; mobile_app: boolean; note: string };
}

export interface TwoFactorSetup {
    secret: string;
    /** What the QR encodes. Rendered in the browser — see the two-factor page. */
    otpauth_url: string;
    issuer: string;
    digits: number;
    period: number;
}

const KEY = {
    sessions: ['client', 'security', 'sessions'] as const,
    devices: ['client', 'security', 'devices'] as const,
    twoFactor: ['client', 'security', '2fa'] as const,
};

/* ── Sessions ────────────────────────────────────────────────────────────── */

export function useSessions() {
    return useQuery({
        queryKey: KEY.sessions,
        queryFn: () => api.get<SessionList>('/client/security/sessions'),
        // Short, because this is the screen somebody opens BECAUSE they think
        // something is wrong. A stale list is the one thing it must not show.
        staleTime: 30 * 1000,
    });
}

export function useDevices() {
    return useQuery({
        queryKey: KEY.devices,
        queryFn: () => api.get<DeviceList>('/client/security/devices'),
        staleTime: 30 * 1000,
    });
}

/**
 * Both lists are invalidated by every revoke, because they are the same rows.
 * Forgetting one is how a device disappears from Sessions and lingers on
 * Devices, which reads as the removal having failed.
 */
function useSecurityMutation<TArgs>(
    fn: (args: TArgs) => Promise<unknown>,
    messages: { success?: string; failure: string },
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: fn,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY.sessions });
            qc.invalidateQueries({ queryKey: KEY.devices });
            if (messages.success) toast.success(messages.success);
        },
        // The server's own wording where there is one: it knows whether the
        // session was already gone, which a generic message cannot say.
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : messages.failure),
    });
}

export function useRevokeSession() {
    return useSecurityMutation<number>(
        (id) => api.del(`/client/security/sessions/${id}`),
        { success: 'Signed out on that device', failure: 'Could not sign out that session.' },
    );
}

export function useRevokeOtherSessions() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => api.post<{ revoked: number }>('/client/security/sessions/revoke-all'),
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: KEY.sessions });
            qc.invalidateQueries({ queryKey: KEY.devices });
            const n = result?.revoked ?? 0;
            toast.success(n === 0
                ? 'There were no other sessions to sign out'
                : `Signed out of ${n} other ${n === 1 ? 'session' : 'sessions'}`);
        },
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'Could not sign out your other sessions.'),
    });
}

export function useRemoveDevice() {
    return useSecurityMutation<number>(
        (id) => api.del(`/client/security/devices/${id}`),
        { success: 'Device removed', failure: 'Could not remove that device.' },
    );
}

/* ── Two-factor ──────────────────────────────────────────────────────────── */

export function useTwoFactor() {
    return useQuery({
        queryKey: KEY.twoFactor,
        queryFn: () => api.get<TwoFactorStatus>('/client/security/2fa'),
        staleTime: 60 * 1000,
    });
}

/**
 * Begin enrolment.
 *
 * ⚠ 2FA is NOT on when this resolves — it returns a secret and a QR, and
 * nothing more. `useConfirmTwoFactor` is what turns it on, because a QR being
 * drawn is not evidence that anybody scanned it.
 */
export function useSetupTwoFactor() {
    return useMutation({
        mutationFn: () => api.post<TwoFactorSetup>('/client/security/2fa/setup'),
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'Could not start two-factor setup.'),
    });
}

export function useConfirmTwoFactor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ code, trustDevice }: { code: string; trustDevice?: boolean }) =>
            api.post<{ codes: string[]; note: string }>('/client/security/2fa/confirm', {
                code,
                trust_device: trustDevice,
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY.twoFactor });
            toast.success('Two-factor authentication is on');
        },
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'That code was not accepted.'),
    });
}

export function useDisableTwoFactor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: { password?: string; code?: string }) =>
            api.post('/client/security/2fa/disable', body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY.twoFactor });
            toast.success('Two-factor authentication is off');
        },
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'Could not turn off two-factor authentication.'),
    });
}

export function useRegenerateBackupCodes() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () =>
            api.post<{ codes: string[]; note: string }>('/client/security/2fa/backup-codes'),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY.twoFactor });
            toast.success('New backup codes generated');
        },
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : 'Could not generate new backup codes.'),
    });
}
