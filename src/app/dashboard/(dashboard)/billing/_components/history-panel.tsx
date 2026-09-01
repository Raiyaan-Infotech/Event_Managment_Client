'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Search, Download, Info, Headphones, ChevronLeft, ChevronRight, X, Clock,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import {
    useBillingHistory, useBillingOverview, formatMoney, type BillingHistoryRow,
} from '@/hooks/use-billing';
import { useClientSettings, useDateFormatter } from '@/hooks/use-client-settings';

/**
 * Billing History — the merged money ledger and subscription lifecycle log.
 *
 * ── WHAT THE SUMMARY RAIL COUNTS ────────────────────────────────────────────
 * The WHOLE account, not the filtered page. A "Transaction Summary" that
 * changed while somebody typed in the search box would be reporting the search
 * rather than the account, and the design places it beside the filters as a
 * stable fact. "Showing 1 to 10 of 26" uses `filtered_count`, which is the
 * other number and deliberately a different one.
 *
 * ── THE TIME-ZONE FOOTNOTE IS THE CLIENT'S OWN ──────────────────────────────
 * The design hardcodes "All times are shown in Asia/Kolkata (GMT +5:30)". Since
 * §336 that is a real preference, so the note reads it — and every timestamp in
 * the table is rendered through the same formatter, which means the sentence
 * and the rows cannot disagree.
 *
 * ── ROWS THAT ARE NOT MONEY CARRY NO AMOUNT ─────────────────────────────────
 * "Subscription created" is a lifecycle fact, not a zero-rupee transaction. The
 * backend sends `amount: null` for those on purpose (§320) and the cell shows a
 * dash — printing ₹0.00 would put a number where there was never a charge.
 */

const TYPE_OPTIONS = [
    { value: 'all', label: 'All Transactions' },
    { value: 'invoice', label: 'Invoices' },
    { value: 'payment', label: 'Payments' },
    { value: 'refund', label: 'Refunds' },
    { value: 'setup', label: 'Setup & Changes' },
];

const PER_PAGE = ['10', '25', '50'];

export function HistoryPanel() {
    const [type, setType] = useState('all');
    const [search, setSearch] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState('10');

    const { data, isLoading, isFetching } = useBillingHistory({
        type, search: search.trim() || undefined,
        from: from || undefined, to: to || undefined,
        page, limit: Number(limit),
    });
    const { data: billing } = useBillingOverview();
    const { data: settings } = useClientSettings();
    const fmt = useDateFormatter();

    const rows = data?.transactions ?? [];
    const summary = data?.summary ?? {};
    const pagination = data?.pagination;
    const sub = billing?.subscription ?? null;

    /** Any filter narrowing the list, so a "clear" control only shows when it would do something. */
    const filtered = type !== 'all' || !!search.trim() || !!from || !!to;

    const showingFrom = useMemo(
        () => (data?.filtered_count ? (page - 1) * Number(limit) + 1 : 0),
        [data?.filtered_count, page, limit],
    );
    const showingTo = useMemo(
        () => Math.min(page * Number(limit), data?.filtered_count ?? 0),
        [page, limit, data?.filtered_count],
    );

    /** Every filter change returns to page 1 — otherwise a narrower result set lands on an empty page. */
    const reset = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1); };

    if (isLoading && !data) return <HistorySkeleton />;

    return (
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex min-w-0 flex-col gap-4">
                <Card className="py-0">
                    <CardContent className="flex min-w-0 flex-col gap-4 p-5">
                        {/* ── Filters ───────────────────────────────────── */}
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => reset(setSearch)(e.target.value)}
                                    placeholder="Search by description or reference…"
                                    className="h-9 ps-8 text-[12.5px]"
                                />
                            </div>

                            <Select value={type} onValueChange={reset(setType)}>
                                <SelectTrigger className="h-9 w-[170px] text-[12.5px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPE_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                            <span className="ms-1.5 text-[11px] opacity-60">
                                                {summary[o.value] ?? 0}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/*
                              Native date inputs. A custom range picker is a lot of
                              surface for two dates, and the native control already
                              knows the person's locale and keyboard.
                            */}
                            <Input
                                type="date" value={from} max={to || undefined}
                                onChange={(e) => reset(setFrom)(e.target.value)}
                                className="h-9 w-[145px] text-[12.5px]" aria-label="From date"
                            />
                            <Input
                                type="date" value={to} min={from || undefined}
                                onChange={(e) => reset(setTo)(e.target.value)}
                                className="h-9 w-[145px] text-[12.5px]" aria-label="To date"
                            />

                            {filtered && (
                                <Button
                                    variant="ghost" size="sm" className="h-9"
                                    onClick={() => {
                                        setType('all'); setSearch(''); setFrom(''); setTo(''); setPage(1);
                                    }}
                                >
                                    <X className="size-3.5" /> Clear
                                </Button>
                            )}
                        </div>

                        {/* ── Table ─────────────────────────────────────── */}
                        {rows.length === 0 ? (
                            <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed p-10 text-center">
                                <Info className="size-5 text-muted-foreground/60" />
                                <p className="text-[13px] font-semibold">Nothing to show</p>
                                <p className="max-w-sm text-[12px] break-words text-muted-foreground">
                                    {filtered
                                        ? 'No billing activity matches these filters.'
                                        : 'Your invoices, payments and plan changes will appear here.'}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <Table className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">Date</TableHead>
                                            <TableHead className="min-w-[220px]">Description</TableHead>
                                            <TableHead className="min-w-[90px]">Type</TableHead>
                                            <TableHead className="min-w-[110px] text-end">Amount</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[150px]">Invoice / Reference</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.map((r) => <HistoryRow key={r.key} row={r} fmt={fmt} />)}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* ── Paging ────────────────────────────────────── */}
                        {rows.length > 0 && (
                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                                <p className="text-[11.5px] text-muted-foreground">
                                    Showing {showingFrom} to {showingTo} of {data?.filtered_count ?? 0}
                                    {filtered && data?.filtered_count !== summary.all
                                        ? ` (filtered from ${summary.all ?? 0})`
                                        : ''}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon" variant="outline" className="size-8"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <span className="text-[12px] tabular-nums">
                                        {pagination?.page ?? 1} / {pagination?.totalPages ?? 1}
                                    </span>
                                    <Button
                                        size="icon" variant="outline" className="size-8"
                                        disabled={!pagination || page >= pagination.totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                    <Select value={limit} onValueChange={reset(setLimit)}>
                                        <SelectTrigger className="h-8 w-[95px] text-[12px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PER_PAGE.map((n) => (
                                                <SelectItem key={n} value={n}>{n} / page</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/*
                  The design's footnote, reading the CLIENT'S zone rather than a
                  hardcoded "Asia/Kolkata" — the table above uses the same
                  setting, so the sentence and the rows cannot disagree.
                */}
                <div className="flex min-w-0 items-start gap-2.5 rounded-lg border bg-muted/40 px-4 py-3">
                    <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <p className="min-w-0 text-[11.5px] break-words text-muted-foreground">
                        All times are shown in{' '}
                        <strong>{(settings?.preferences?.time_zone ?? 'Asia/Kolkata').replace(/_/g, ' ')}</strong>
                        . You can change this under{' '}
                        <Link href="/dashboard/settings?tab=preferences" className="underline underline-offset-2">
                            Settings › Preferences
                        </Link>
                        .
                    </p>
                </div>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
                <Card className="py-0">
                    <CardContent className="p-5">
                        <h3 className="text-[13.5px] font-semibold">Billing Summary</h3>
                        <dl className="mt-3.5 flex flex-col gap-2.5 text-[12.5px]">
                            <Row label="Current Plan" value={sub?.plan?.name ?? 'No plan'} />
                            <Row label="Billing Cycle" value={sub?.billing_cycle ?? '—'} capitalize />
                            <Row
                                label="Amount"
                                value={sub ? formatMoney(sub.amount?.total ?? null, sub.currency_code) : '—'}
                            />
                            <Row
                                label="Next Billing Date"
                                value={sub?.next_billing_date ? fmt(sub.next_billing_date) : 'No upcoming charge'}
                            />
                        </dl>
                        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                            <Link href="/dashboard/billing/change-plan">Manage Billing</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="py-0">
                    <CardContent className="p-5">
                        <h3 className="text-[13.5px] font-semibold">Transaction Summary</h3>
                        <p className="mt-1 text-[11px] break-words text-muted-foreground">
                            Across your whole account, not the filters above.
                        </p>
                        <div className="mt-3.5 flex flex-col gap-2">
                            <CountRow label="All transactions" value={summary.all ?? 0} tone="text-primary" bold />
                            <Separator />
                            <CountRow label="Payments" value={summary.payment ?? 0} tone="text-emerald-600 dark:text-emerald-400" />
                            <CountRow label="Invoices" value={summary.invoice ?? 0} tone="text-blue-600 dark:text-blue-400" />
                            <CountRow label="Refunds" value={summary.refund ?? 0} tone="text-amber-600 dark:text-amber-400" />
                            <CountRow label="Failed" value={summary.failed ?? 0} tone="text-destructive" />
                        </div>
                        {/*
                          ⚠ "Download Statement" is deliberately not offered. There
                          is no statement generator, and a button that produces
                          nothing is worse than no button. Each invoice can be
                          printed from its own page (§323).
                        */}
                        <p className="mt-4 rounded-md border bg-muted/40 p-3 text-[11px] break-words text-muted-foreground">
                            An account-wide statement download is not available yet. Individual
                            invoices can be saved as PDF from the invoice page.
                        </p>
                    </CardContent>
                </Card>

                <Card className="py-0">
                    <CardContent className="p-5">
                        <span className="grid size-9 place-items-center rounded-full bg-primary/10">
                            <Headphones className="size-[17px] text-primary" />
                        </span>
                        <h3 className="mt-3 text-[13.5px] font-semibold">Need Help?</h3>
                        <p className="mt-1.5 text-[12px] break-words text-muted-foreground">
                            Questions about a charge or an invoice? Send us the details and somebody
                            will come back to you.
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-3.5 w-full">
                            <Link href="/dashboard/billing/contact-sales">Contact us</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

const TYPE_LABEL: Record<string, string> = {
    invoice: 'Invoice', payment: 'Payment', refund: 'Refund',
    adjustment: 'Adjustment', setup: 'Setup',
};

function HistoryRow({
    row, fmt,
}: {
    row: BillingHistoryRow;
    fmt: (v: string | null | undefined, withTime?: boolean) => string;
}) {
    return (
        <TableRow>
            <TableCell className="text-[12px] whitespace-nowrap">
                {fmt(row.occurred_at, true)}
            </TableCell>
            <TableCell>
                <p className="max-w-[280px] text-[12.5px] break-all line-clamp-2" title={row.description ?? ''}>
                    {row.description ?? '—'}
                </p>
            </TableCell>
            <TableCell>
                <Badge variant="secondary" className="h-5 text-[10.5px]">
                    {TYPE_LABEL[row.type] ?? row.type}
                </Badge>
            </TableCell>
            <TableCell className="text-end text-[12.5px] font-medium tabular-nums whitespace-nowrap">
                {/*
                  NULL is not zero. A lifecycle row ("Subscription created") never
                  had an amount, and ₹0.00 would put a number where there was
                  never a charge. The sign comes from the data (§320): an invoice
                  is positive, a payment negative.
                */}
                {row.amount === null
                    ? <span className="text-muted-foreground">—</span>
                    : (
                        <span className={row.amount < 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                            {row.amount < 0 ? '- ' : ''}
                            {formatMoney(Math.abs(row.amount), row.currency_code ?? 'INR')}
                        </span>
                    )}
            </TableCell>
            <TableCell>
                <StatusBadge status={row.status} />
            </TableCell>
            <TableCell>
                {row.invoice_id ? (
                    <div className="flex items-center gap-1.5">
                        <Link
                            href={`/dashboard/billing/invoices/${row.invoice_id}`}
                            className="text-[12px] break-all underline underline-offset-2"
                        >
                            {row.invoice_number ?? `Invoice #${row.invoice_id}`}
                        </Link>
                        {/* Links to the invoice, which carries the print action —
                            rather than a download icon with nothing behind it. */}
                        <Link
                            href={`/dashboard/billing/invoices/${row.invoice_id}`}
                            aria-label="Open invoice"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Download className="size-3.5" />
                        </Link>
                    </div>
                ) : (
                    <span className="text-[12px] break-all text-muted-foreground">
                        {row.reference ?? '—'}
                    </span>
                )}
            </TableCell>
        </TableRow>
    );
}

const STATUS_TONE: Record<string, string> = {
    succeeded: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400',
    completed: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400',
    paid: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400',
    pending: 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
    failed: 'bg-destructive/12 text-destructive',
};

function StatusBadge({ status }: { status: string }) {
    const tone = STATUS_TONE[status] ?? 'bg-muted text-muted-foreground';
    return (
        <span className={`inline-flex h-5 items-center rounded-full px-2 text-[10.5px] font-medium capitalize ${tone}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className={`min-w-0 text-end font-medium break-words ${capitalize ? 'capitalize' : ''}`}>
                {value}
            </dd>
        </div>
    );
}

function CountRow({ label, value, tone, bold }: {
    label: string; value: number; tone: string; bold?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3 text-[12.5px]">
            <span className={`min-w-0 break-words ${bold ? 'font-semibold' : 'text-muted-foreground'}`}>
                {label}
            </span>
            <span className={`shrink-0 font-semibold tabular-nums ${tone}`}>{value}</span>
        </div>
    );
}

function HistorySkeleton() {
    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <Skeleton className="h-96 rounded-xl" />
            <div className="flex flex-col gap-4">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
            </div>
        </div>
    );
}
