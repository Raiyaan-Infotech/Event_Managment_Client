'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError, type Pagination } from '@/lib/api-client';

/**
 * Billing.
 *
 * ── WHAT THESE HOOKS COVER ──────────────────────────────────────────────────
 * The subscription (overview, plans, change, cancel, resume), invoices and
 * their detail, the merged billing history, and the Contact Sales form.
 *
 * ── WHAT IS DELIBERATELY ABSENT ─────────────────────────────────────────────
 * There is no `useCheckout` and no `usePaymentMethods`. Both need a payment
 * provider this project does not have, and stubbing them would mean a
 * "Pay ₹16,228" button that takes no money and a receipt for a payment that
 * never happened.
 *
 * Every invoice payload carries `payments_enabled` and a reason, so the screens
 * describe the real state instead of each hardcoding an assumption — and they
 * change behaviour on their own the day a gateway is wired, with nobody having
 * to remember which files to revisit.
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

export interface BillingPlan {
    id: number;
    name: string;
    plan_code: string;
    short_description: string | null;
    billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
    currency_code: string;
    price: string;
    trial_days: number;
    is_active: number;
    is_visible: number;
    sort_order: number;
}

/** Money. `price` is PRE-TAX and tax is added on top — never carved out. */
export interface Money {
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    tax_inclusive: false;
}

/**
 * The status to DISPLAY, which is not always the status stored.
 *
 * `cancelling` exists only here and in the service that derives it: a term that
 * has been cancelled but has not yet ended is neither active nor cancelled —
 * access continues and no renewal will follow. It is not a stored value.
 */
export type BillingStatus = 'active' | 'trialing' | 'cancelling' | 'cancelled' | 'expired';

export interface BillingSubscription {
    id: number;
    status: BillingStatus;
    stored_status: string;
    plan: BillingPlan | null;
    billing_cycle: BillingPlan['billing_cycle'];
    started_at: string;
    current_period_start: string;
    current_period_end: string | null;
    /** Null when cancelled or on a lifetime term — there is no next charge. */
    next_billing_date: string | null;
    trial_ends_at: string | null;
    is_trialing: boolean;
    cancel_at_period_end: boolean;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    amount: Money;
    currency_code: string;
    pending_change: { plan: BillingPlan | null; effective_at: string } | null;
}

/**
 * One usage figure.
 *
 * `available: false` means the number is UNKNOWN, not zero, and `reason` says
 * why. The distinction is the whole point: a 0 and an unbuilt feature look
 * identical on a tile and mean opposite things.
 */
export interface UsageMetric {
    used: number | null;
    limit: number | null;
    available: boolean;
    reason?: string;
}

export interface BillingUsage {
    period_start: string | null;
    period_end: string | null;
    events: UsageMetric;
    guests: UsageMetric & { per_event_limit: number | null };
    messages: UsageMetric;
    /** The ceiling is known; nothing measures the numerator. */
    storage: { used_gb: number | null; limit_gb: number | null; available: boolean; reason?: string };
    rsvps: { limit: number | null };
}

export interface BillingOverview {
    subscription: BillingSubscription | null;
    reason: string | null;
    features: { id: number; label: string; group: string }[];
    usage: BillingUsage;
    unavailable: Record<string, string>;
}

export interface AvailablePlans {
    current_plan_id: number | null;
    subscription: BillingSubscription | null;
    plans: (BillingPlan & {
        amount: Money;
        features: { id: number; label: string; group: string }[];
        is_current: boolean;
        is_pending: boolean;
    })[];
    change_effective_at: string | null;
}

/**
 * One row of Billing History.
 *
 * The endpoint MERGES two tables: the money ledger (`client_transactions`) and
 * the subscription lifecycle log (`client_subscription_events`). The design's
 * own table mixes them — "Payment for INV-…" beside "Subscription created" — so
 * the merge happens server-side and this is the single shape that comes back.
 *
 * `amount: null` means the row carries no money at all (a plan change is not a
 * zero-rupee transaction), and renders as an em dash rather than ₹0.00.
 */
export interface BillingHistoryRow {
    key: string;
    occurred_at: string;
    description: string | null;
    type: 'invoice' | 'payment' | 'refund' | 'adjustment' | 'setup';
    event_type?: string;
    amount: number | null;
    currency_code: string | null;
    status: string;
    reference: string | null;
    invoice_id: number | null;
    invoice_number: string | null;
}

export interface BillingHistory {
    transactions: BillingHistoryRow[];
    pagination: Pagination;
    summary: Record<string, number>;
    note: string;
}

/* ── Invoices ─────────────────────────────────────────────────────────────── */

export interface InvoiceTaxComponent { label: string; rate: number; amount: number }

/**
 * `status` is DERIVED server-side — `unpaid`, `paid`, `partially_paid`,
 * `overdue`, `cancelled`, `refunded`, `draft`. `stored_status` is the column.
 *
 * `overdue` cannot occur while payments are disabled: no due date is stamped,
 * because an invoice nobody can pay must not be shown as the client's fault.
 */
export interface Invoice {
    id: number;
    invoice_number: string;
    status: string;
    stored_status: string;
    issue_date: string;
    due_date: string | null;
    paid_at: string | null;
    period_start: string | null;
    period_end: string | null;
    currency_code: string;
    subtotal: number;
    discount_amount: number;
    tax_rate: number;
    tax_amount: number;
    tax_breakdown: InvoiceTaxComponent[];
    tax_inclusive: boolean;
    total: number;
    amount_paid: number;
    amount_due: number;
    billing_name: string | null;
    billing_email: string | null;
    billing_address: string | null;
    billing_gstin: string | null;
    notes: string | null;
    plan: { id: number; name: string } | null;
    items?: {
        id: number; item_type: string; description: string;
        period_start: string | null; period_end: string | null;
        quantity: number; unit_price: number; amount: number;
    }[];
    transactions?: {
        id: number; type: string; status: string; description: string | null;
        amount: number; reference: string | null; occurred_at: string;
    }[];
}

export interface InvoiceList {
    invoices: Invoice[];
    pagination: Pagination;
    stats: {
        total_invoices: number;
        total_amount: number;
        paid_amount: number;
        outstanding_amount: number;
        by_status: Record<string, number>;
    };
    payments_enabled: boolean;
    payments_reason: string | null;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Queries
 * ────────────────────────────────────────────────────────────────────────── */

const KEY = {
    overview: ['billing', 'overview'] as const,
    plans: ['billing', 'plans'] as const,
    history: ['billing', 'history'] as const,
    invoices: ['billing', 'invoices'] as const,
};

export function useBillingOverview() {
    return useQuery({
        queryKey: KEY.overview,
        queryFn: () => api.get<BillingOverview>('/client/billing/overview'),
        staleTime: 60 * 1000,
    });
}

export function useBillingPlans() {
    return useQuery({
        queryKey: KEY.plans,
        queryFn: () => api.get<AvailablePlans>('/client/billing/plans'),
        staleTime: 5 * 60 * 1000,
    });
}

export function useBillingHistory(params: { type?: string; page?: number } = {}) {
    return useQuery({
        queryKey: [...KEY.history, params.type ?? 'all', params.page ?? 1],
        queryFn: () =>
            api.get<BillingHistory>('/client/billing/history', {
                type: params.type,
                page: params.page,
            }),
        staleTime: 60 * 1000,
    });
}

export function useInvoices(params: { status?: string; search?: string; page?: number } = {}) {
    return useQuery({
        queryKey: [...KEY.invoices, params.status ?? 'all', params.search ?? '', params.page ?? 1],
        queryFn: () =>
            api.get<InvoiceList>('/client/billing/invoices', {
                status: params.status,
                search: params.search || undefined,
                page: params.page,
            }),
        staleTime: 60 * 1000,
    });
}

export function useInvoice(id: number | null) {
    return useQuery({
        queryKey: [...KEY.invoices, 'detail', id],
        queryFn: () =>
            api.get<{ invoice: Invoice; payments_enabled: boolean; payments_reason: string | null }>(
                `/client/billing/invoices/${id}`,
            ),
        enabled: id !== null && Number.isFinite(id),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Contact Sales.
 *
 * ⚠ The submission is STORED, not emailed — there is no SMTP in this system.
 * The response carries `delivery: 'stored'` so the screen promises a follow-up
 * rather than implying a message just went out.
 */
export interface SalesEnquiry {
    full_name: string;
    work_email: string;
    company_name?: string;
    phone?: string;
    events_per_year?: string;
    interests?: string[];
    message: string;
    preferred_time?: string;
}

export function useContactSales() {
    return useMutation({
        mutationFn: (body: SalesEnquiry) =>
            api.post<{ id: number; message: string; delivery: string }>(
                '/client/billing/contact-sales',
                body,
            ),
        onSuccess: (data) => toast.success(data.message),
        onError: (error) =>
            toast.error(
                error instanceof ApiError ? error.message : 'Could not send your enquiry.',
            ),
    });
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Mutations
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Every billing mutation invalidates the same three queries plus `client/me`.
 *
 * `refetchType: 'all'` is not optional here. The app's query client sets
 * `staleTime: 10 min` and `refetchOnMount: false`, and React Query only
 * auto-refetches ACTIVE queries — so a plan change made on the Change Plan
 * screen would leave the Overview showing a ten-minute-old plan on return.
 * That exact combination has produced a "the list still says Active" bug in
 * this codebase before.
 *
 * `client/me` is included because the plan is the ENTITLEMENT: the sidebar's
 * plan card, the event wizard's options and the template gating all read it.
 */
function useBillingMutation<TArgs>(
    fn: (args: TArgs) => Promise<unknown>,
    messages: { success: string; failure: string },
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: fn,
        onSuccess: () => {
            toast.success(messages.success);
            for (const key of [KEY.overview, KEY.plans, KEY.history, KEY.invoices, ['client', 'me']]) {
                qc.invalidateQueries({ queryKey: key, refetchType: 'all' });
            }
        },
        onError: (error) =>
            toast.error(error instanceof ApiError ? error.message : messages.failure),
    });
}

/**
 * Schedule a plan change for the end of the current term.
 *
 * ⚠ SCHEDULED, never immediate — which is what the Change Plan screen's own
 * banner says. An immediate upgrade would have to charge the difference, and
 * there is nothing to charge it with; applying it for free instead would hand
 * out a paid plan on a button press.
 *
 * The body key is `plan_id`, not `planId`: the backend's `bodyTransform`
 * snake_cases incoming keys, and the controller reads the snake_case form.
 */
export function useChangePlan() {
    return useBillingMutation<number>(
        (planId) => api.post('/client/billing/change-plan', { plan_id: planId }),
        { success: 'Plan change scheduled', failure: 'Could not change your plan.' },
    );
}

export function useCancelSubscription() {
    return useBillingMutation<{ reason?: string; comments?: string }>(
        (body) => api.post('/client/billing/cancel', body),
        {
            success: 'Subscription cancelled — you keep access until the end of your term',
            failure: 'Could not cancel your subscription.',
        },
    );
}

export function useResumeSubscription() {
    return useBillingMutation<void>(
        () => api.post('/client/billing/resume'),
        { success: 'Subscription resumed', failure: 'Could not resume your subscription.' },
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Formatting
 * ────────────────────────────────────────────────────────────────────────── */

export function formatMoney(amount: number | string | null, currency = 'INR') {
    const n = Number(amount);
    if (!Number.isFinite(n)) return '—';
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            maximumFractionDigits: 2,
        }).format(n);
    } catch {
        // An unknown currency code must not take the whole card down with it.
        return `${currency} ${n.toFixed(2)}`;
    }
}

/**
 * A date, formatted from its PARTS.
 *
 * Never `new Date(value).toLocaleDateString()` on a bare date — that parses as
 * UTC and renders the previous day for anyone behind it, which on a "next
 * billing date" is a support ticket.
 */
export function formatDate(value: string | null | undefined) {
    if (!value) return '—';
    const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return '—';
    const [, y, mo, d] = m;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${Number(d)} ${months[Number(mo) - 1]} ${y}`;
}

export const CYCLE_LABEL: Record<string, string> = {
    monthly: 'Billed monthly',
    quarterly: 'Billed quarterly',
    yearly: 'Billed yearly',
    lifetime: 'One-time payment',
};

export const CYCLE_SUFFIX: Record<string, string> = {
    monthly: '/month',
    quarterly: '/quarter',
    yearly: '/year',
    lifetime: '',
};
