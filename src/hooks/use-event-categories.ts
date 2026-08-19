'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError, type Paginated } from '@/lib/api-client';

/**
 * ── SAMPLE MODULE ────────────────────────────────────────────────────────────
 * Event Categories, wired to GET/POST/PUT/PATCH/DELETE /api/v1/event-categories.
 *
 * This file is the template for every other module. To add one, copy it and
 * change four things: the `Row` shape, `ENDPOINT`, `KEY`, and the label used in
 * the toasts. Nothing else here is specific to categories.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINT = '/event-categories';
/** Every query/mutation for this module hangs off one root key. */
const KEY = ['event-categories'] as const;
const LABEL = 'Category';

export interface EventCategory {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    sort_order: number;
    /** 0 = inactive, 1 = active, 2 = pending approval. */
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface EventCategoryPayload {
    name: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    sort_order?: number;
    is_active?: number;
}

export interface ListParams {
    search?: string;
    is_active?: number | '';
    page?: number;
    limit?: number;
}

/**
 * The backend answers `{ data: [...], pagination: {...} }` inside its envelope,
 * which api-client already unwrapped — so this is the shape we receive.
 */
export function useEventCategories(params: ListParams = {}) {
    return useQuery({
        queryKey: [...KEY, 'list', params],
        queryFn: () =>
            api.get<Paginated<EventCategory>>(ENDPOINT, {
                search: params.search,
                is_active: params.is_active === '' ? undefined : params.is_active,
                page: params.page ?? 1,
                limit: params.limit ?? 10,
                sort_by: 'sort_order',
                sort_order: 'ASC',
            }),
    });
}

export function useEventCategory(id: number | null) {
    return useQuery({
        queryKey: [...KEY, 'detail', id],
        queryFn: () => api.get<EventCategory>(`${ENDPOINT}/${id}`),
        // Without this an id of null would fire GET /event-categories/null.
        enabled: !!id,
    });
}

/**
 * One error handler for every mutation, so a failure always reads the same.
 * A 401/403 is called out separately — "Failed to save" is misleading when the
 * real problem is that the session expired.
 */
function reportError(error: unknown, verb: string) {
    if (error instanceof ApiError && error.isAuthError) {
        toast.error('Your session has expired. Please sign in again.');
        return;
    }
    toast.error(error instanceof Error ? error.message : `Failed to ${verb} ${LABEL.toLowerCase()}`);
}

export function useCreateEventCategory(onDone?: (row: EventCategory) => void) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: EventCategoryPayload) => api.post<EventCategory>(ENDPOINT, data),
        onSuccess: (row) => {
            toast.success(`${LABEL} created successfully`);
            // refetchType 'all' also refreshes queries that are currently
            // unmounted — otherwise navigating back shows the stale list.
            qc.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            onDone?.(row);
        },
        onError: (e) => reportError(e, 'create'),
    });
}

export function useUpdateEventCategory(onDone?: (row: EventCategory) => void) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: EventCategoryPayload }) =>
            api.put<EventCategory>(`${ENDPOINT}/${id}`, data),
        onSuccess: (row) => {
            toast.success(`${LABEL} updated successfully`);
            qc.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
            onDone?.(row);
        },
        onError: (e) => reportError(e, 'update'),
    });
}

/** Status is its own endpoint — it bypasses the approval flow on the backend. */
export function useUpdateEventCategoryStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
            api.patch<EventCategory>(`${ENDPOINT}/${id}/status`, { is_active: is_active ? 1 : 0 }),
        onSuccess: () => {
            toast.success('Status updated');
            qc.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
        },
        onError: (e) => reportError(e, 'update'),
    });
}

export function useDeleteEventCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.del<unknown>(`${ENDPOINT}/${id}`),
        onSuccess: () => {
            toast.success(`${LABEL} deleted`);
            qc.invalidateQueries({ queryKey: KEY, refetchType: 'all' });
        },
        onError: (e) => reportError(e, 'delete'),
    });
}
