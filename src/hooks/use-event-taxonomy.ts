'use client';

import { useQuery } from '@tanstack/react-query';
import { api, type ListResult } from '@/lib/api-client';

/**
 * The three-level event taxonomy, straight from the
 * backend. Built on the same pattern as `use-event-categories.ts` — see
 * INTEGRATION.md.
 *
 * Category -> Type -> Religion is a real cascade in the schema: `event_types`
 * has a NOT NULL `event_category_id`, and `religions` is scoped by BOTH
 * category and type. Each hook is therefore `enabled` only once its parent is
 * chosen, so we never fire a request that the backend would answer with an
 * unfiltered list the user must not see.
 */

export interface TaxonomyRow {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    sort_order: number;
    is_active: number;
}

/** Only active rows — a client must not be offered a disabled category. */
const ACTIVE = { is_active: 1, limit: 100, sort_by: 'sort_order', sort_order: 'ASC' } as const;

export function useEventCategoryOptions() {
    return useQuery({
        queryKey: ['event-categories', 'options'],
        queryFn: () => api.getList<TaxonomyRow>('/event-categories', { ...ACTIVE }),
        staleTime: 5 * 60 * 1000,
    });
}

export function useEventTypeOptions(categoryId: number | null) {
    return useQuery({
        queryKey: ['event-types', 'options', categoryId],
        queryFn: () =>
            api.getList<TaxonomyRow>('/event-types', { ...ACTIVE, event_category_id: categoryId }),
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useReligionOptions(categoryId: number | null, typeId: number | null) {
    return useQuery({
        queryKey: ['religions', 'options', categoryId, typeId],
        queryFn: () =>
            api.getList<TaxonomyRow>('/religions', {
                ...ACTIVE,
                event_category_id: categoryId,
                event_type_id: typeId,
            }),
        // Religions are scoped to the PAIR, so both are required.
        enabled: !!categoryId && !!typeId,
        staleTime: 5 * 60 * 1000,
    });
}
