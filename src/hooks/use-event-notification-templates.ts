'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api-client';
import type { EventStatus, TaxonomyRef } from '@/hooks/use-client-events';

/**
 * A client's per-event control over the admin notification-template catalogue.
 *
 * ── "ON" UNLESS SET OFF ──────────────────────────────────────────────────────
 * Every template that applies to an event (matched server-side by the event's
 * category/type) starts enabled. `is_set` tells the UI whether that `enabled`
 * value is the default or a deliberate choice — same convention as this
 * portal's own Settings screen (`use-client-settings.ts`'s `NotificationType`).
 *
 * ── NOTHING SENDS YET ────────────────────────────────────────────────────────
 * No trigger fires these notifications automatically today (confirmed with
 * Jamal). This screen only records the choice so it is already correct the
 * day a trigger reads it.
 */

const ENDPOINT = '/client/events';
const SUMMARY_KEY = ['client', 'event-notification-templates', 'summary'] as const;
const DETAIL_KEY = ['client', 'event-notification-templates', 'detail'] as const;

export interface EventNotificationSummaryRow {
    id: number;
    name: string;
    status: EventStatus;
    category: TaxonomyRef | null;
    templates_count: number;
    active_count: number;
    inactive_count: number;
    updated_at: string;
}

export interface EventNotificationSummary {
    events: EventNotificationSummaryRow[];
    totals: {
        total_events: number;
        total_templates: number;
        active_templates: number;
        inactive_templates: number;
    };
}

export interface ApplicableTemplate {
    id: number;
    name: string;
    title: string;
    content: string;
    image_url: string | null;
    notificationCategory: { id: number; name: string; icon: string | null; color: string | null } | null;
    category: TaxonomyRef | null;
    enabled: boolean;
    is_set: boolean;
}

export interface EventApplicableTemplates {
    event: { id: number; name: string; status: EventStatus };
    templates: ApplicableTemplate[];
}

function reportError(error: unknown, verb: string) {
    if (error instanceof ApiError && error.isAuthError) {
        toast.error('Your session has expired. Please sign in again.');
        return;
    }
    toast.error(error instanceof Error ? error.message : `Failed to ${verb} notification template`);
}

export function useEventNotificationSummary() {
    return useQuery({
        queryKey: SUMMARY_KEY,
        queryFn: () => api.get<EventNotificationSummary>(`${ENDPOINT}/notification-templates/summary`),
        retry: false,
    });
}

export function useEventNotificationTemplates(eventId: number | null) {
    return useQuery({
        queryKey: [...DETAIL_KEY, eventId],
        queryFn: () => api.get<EventApplicableTemplates>(`${ENDPOINT}/${eventId}/notification-templates`),
        enabled: !!eventId,
        retry: false,
    });
}

export function useToggleEventNotificationTemplate(eventId: number | null) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ templateId, enabled }: { templateId: number; enabled: boolean }) =>
            api.patch<{ template_id: number; enabled: boolean }>(
                `${ENDPOINT}/${eventId}/notification-templates/${templateId}`,
                { enabled }
            ),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [...DETAIL_KEY, eventId] });
            qc.invalidateQueries({ queryKey: SUMMARY_KEY });
        },
        onError: (e) => reportError(e, 'update'),
    });
}
