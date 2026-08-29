'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Calendar, Users, Mail, HardDrive, CheckCircle2, AlertTriangle, Crown,
    Headphones, ArrowRight, Loader2, Info, Clock, RotateCcw,
    CreditCard, FileText, Receipt, Search,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import {
    useBillingOverview, useBillingHistory, useInvoices,
    useCancelSubscription, useResumeSubscription,
    formatMoney, formatDate, CYCLE_LABEL, CYCLE_SUFFIX,
    type BillingStatus, type UsageMetric,
} from '@/hooks/use-billing';

/**
 * Billing.
 *
 * ── WHAT IS REAL ON THIS SCREEN ─────────────────────────────────────────────
 * The plan, its price and billing cycle, the term dates, the next billing date,
 * cancel and resume, a scheduled plan change, and the events/guests figures —
 * all from `client_subscriptions` and the client's own rows.
 *
 * ── WHAT IS NOT, AND WHY IT SAYS SO RATHER THAN SHOWING A NUMBER ────────────
 * The supplied design also has Invoices, Payment Methods, Billing History as
 * transactions, saved cards, add-ons, coupons, a billing address and a
 * "Messages Sent" figure. None of those has a table, and three of them need a
 * payment provider this project does not have.
 *
 * Every one of them therefore renders an explicit state naming what it is
 * waiting on. The reasons come from the API's `unavailable` block, not from
 * strings typed here, so these unlock when the backend stops reporting them —
 * nobody has to remember to come back and edit this file.
 *
 * The one that matters most: STORAGE has a known ceiling (the plan's
 * `storage_gb`) and NOTHING measures the numerator. A progress bar there would
 * look precise and be invented, so the ceiling is shown and the usage is not.
 */

const STATUS_STYLE: Record<BillingStatus, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
    trialing: { label: 'Trial', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
    // Distinct from both Active and Cancelled on purpose: access continues, and
    // no renewal will follow. Showing "Active" here would hide the ending.
    cancelling: { label: 'Ending soon', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    cancelled: { label: 'Cancelled', className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
    expired: { label: 'Expired', className: 'bg-muted text-muted-foreground' },
};

/** A card that names what it is waiting on, rather than rendering empty. */
function NotAvailable({ title, reason, icon: Icon }: {
    title: string; reason?: string; icon?: React.ElementType;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
            {Icon ? <Icon className="size-5 text-muted-foreground" /> : null}
            <p className="text-sm font-medium">{title}</p>
            <p className="max-w-md text-[12.5px] text-muted-foreground">
                {reason ?? 'This is not available yet.'}
            </p>
        </div>
    );
}

/**
 * One usage tile.
 *
 * Three distinct renderings, because they are three different claims:
 *   available + limit    a figure and its ceiling, with a bar
 *   available, no limit  a figure and "No limit set" — the plan sets none
 *   not available        an em dash and the reason. NEVER a zero.
 */
function UsageTile({ icon: Icon, label, metric, unit, tint }: {
    icon: React.ElementType;
    label: string;
    metric: UsageMetric & { used_gb?: number | null; limit_gb?: number | null };
    unit?: string;
    tint: string;
}) {
    const used = metric.used ?? metric.used_gb ?? null;
    const limit = metric.limit ?? metric.limit_gb ?? null;
    const known = metric.available && used !== null;
    const pct = known && limit ? Math.min(100, Math.round((Number(used) / limit) * 100)) : null;
    const over = known && limit !== null && Number(used) > limit;

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tint}`}>
                    <Icon className="size-4" />
                </span>
                <span className="min-w-0 text-[12.5px] font-medium text-muted-foreground">{label}</span>
            </div>

            <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-semibold tabular-nums ${known ? '' : 'text-muted-foreground/50'}`}>
                    {known ? Number(used).toLocaleString('en-IN') : '—'}
                </span>
                {unit && known ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
                {limit !== null ? (
                    <span className="text-xs text-muted-foreground">
                        / {limit.toLocaleString('en-IN')}{unit ? ` ${unit}` : ''}
                    </span>
                ) : null}
            </div>

            {pct !== null ? (
                <div className="flex flex-col gap-1">
                    <Progress value={Math.min(100, pct)} className={over ? '[&>*]:bg-rose-500' : ''} />
                    <span className={`text-[11px] ${over ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                        {over ? `Over your plan limit by ${Number(used) - limit}` : `${pct}%`}
                    </span>
                </div>
            ) : (
                <span className="text-[11px] break-words text-muted-foreground">
                    {metric.available ? 'No limit set on your plan' : metric.reason ?? 'Not available yet'}
                </span>
            )}
        </div>
    );
}

export default function BillingPage() {
    const { data, isLoading } = useBillingOverview();
    const cancel = useCancelSubscription();
    const resume = useResumeSubscription();

    const [cancelOpen, setCancelOpen] = useState(false);
    const [reason, setReason] = useState('');

    const sub = data?.subscription ?? null;
    const unavailable = data?.unavailable ?? {};
    const status = sub?.status;
    const cycleSuffix = sub ? CYCLE_SUFFIX[sub.billing_cycle] ?? '' : '';

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5 p-4 md:p-6">
                <Skeleton className="h-8 w-40" />
                <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
                <Skeleton className="h-40 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-5 p-4 md:p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your subscription and see what you have used.
                </p>
            </div>

            <Tabs defaultValue="overview" className="gap-5">
                <TabsList variant="line" className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* ── OVERVIEW ─────────────────────────────────────────────── */}
                <TabsContent value="overview" className="flex flex-col gap-5">
                    {!sub ? (
                        <Card className="py-0">
                            <CardContent className="p-6">
                                <NotAvailable
                                    icon={AlertTriangle}
                                    title="No active subscription"
                                    reason={data?.reason ?? undefined}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {sub.pending_change ? (
                                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                                    <Clock className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <p className="min-w-0 text-[12.5px] break-words">
                                        <span className="font-medium">
                                            Switching to {sub.pending_change.plan?.name ?? 'another plan'}
                                        </span>{' '}
                                        on {formatDate(sub.pending_change.effective_at)}. You stay on{' '}
                                        {sub.plan?.name} until then.
                                    </p>
                                </div>
                            ) : null}

                            {sub.cancel_at_period_end ? (
                                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3">
                                    <AlertTriangle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                    <p className="min-w-0 flex-1 text-[12.5px] break-words">
                                        Your subscription ends on{' '}
                                        <span className="font-medium">{formatDate(sub.current_period_end)}</span>.
                                        You keep full access until then.
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={resume.isPending}
                                        onClick={() => resume.mutate()}
                                    >
                                        {resume.isPending
                                            ? <Loader2 className="size-3.5 animate-spin" />
                                            : <RotateCcw className="size-3.5" />}
                                        Resume
                                    </Button>
                                </div>
                            ) : null}

                            <div className="grid min-w-0 gap-5 lg:grid-cols-[1.4fr_1fr]">
                                {/* Current plan */}
                                <Card className="py-0">
                                    <CardContent className="flex flex-col gap-5 p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[12.5px] font-medium text-muted-foreground">
                                                Current Plan
                                            </span>
                                            {status ? (
                                                <Badge variant="ghost" className={STATUS_STYLE[status].className}>
                                                    {STATUS_STYLE[status].label}
                                                </Badge>
                                            ) : null}
                                        </div>

                                        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                                            <div className="flex min-w-0 flex-col gap-2">
                                                <h2 className="text-xl font-semibold break-words">
                                                    {sub.plan?.name ?? 'Unknown plan'}
                                                </h2>
                                                {sub.plan?.short_description ? (
                                                    <p className="text-[12.5px] break-words text-muted-foreground">
                                                        {sub.plan.short_description}
                                                    </p>
                                                ) : null}
                                                <div className="mt-1 flex items-baseline gap-1">
                                                    <span className="text-3xl font-semibold">
                                                        {formatMoney(sub.amount.subtotal, sub.currency_code)}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">{cycleSuffix}</span>
                                                </div>
                                                <span className="text-[12.5px] text-muted-foreground">
                                                    {CYCLE_LABEL[sub.billing_cycle]}
                                                    {' · plus '}
                                                    {formatMoney(sub.amount.tax_amount, sub.currency_code)}
                                                    {` tax (${sub.amount.tax_rate}%)`}
                                                </span>
                                            </div>

                                            {/*
                                              The feature list is the menus this plan actually GRANTS —
                                              the only per-plan feature data in the database that is true.
                                            */}
                                            <div className="flex min-w-0 flex-col gap-1.5">
                                                {(data?.features ?? []).map((f) => (
                                                    <div key={f.id} className="flex items-start gap-2">
                                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                                        <span className="min-w-0 text-[12.5px] break-words">{f.label}</span>
                                                    </div>
                                                ))}
                                                {!data?.features?.length ? (
                                                    <span className="text-[12.5px] text-muted-foreground">
                                                        This plan grants no modules yet.
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[12.5px] text-muted-foreground">
                                                {sub.next_billing_date
                                                    ? <>Next billing date: <span className="font-medium text-foreground">{formatDate(sub.next_billing_date)}</span></>
                                                    : sub.billing_cycle === 'lifetime'
                                                        ? 'This plan does not renew.'
                                                        : 'No further billing is scheduled.'}
                                            </span>
                                            <div className="ms-auto flex flex-wrap items-center gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href="/dashboard/billing/change-plan">Change Plan</Link>
                                                </Button>
                                                {!sub.cancel_at_period_end && status !== 'cancelled' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-rose-600 hover:text-rose-600 dark:text-rose-400"
                                                        onClick={() => setCancelOpen(true)}
                                                    >
                                                        Cancel Subscription
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Summary */}
                                <Card className="py-0">
                                    <CardContent className="flex flex-col gap-4 p-5">
                                        <span className="text-[12.5px] font-medium text-muted-foreground">
                                            Billing Summary
                                        </span>
                                        <dl className="flex flex-col gap-3 text-[12.5px]">
                                            {[
                                                ['Plan', sub.plan?.name ?? '—'],
                                                ['Billing Cycle', CYCLE_LABEL[sub.billing_cycle] ?? sub.billing_cycle],
                                                ['Amount', `${formatMoney(sub.amount.subtotal, sub.currency_code)} + tax`],
                                                ['Tax', `${formatMoney(sub.amount.tax_amount, sub.currency_code)} (${sub.amount.tax_rate}%)`],
                                                ['Total', formatMoney(sub.amount.total, sub.currency_code)],
                                                ['Started', formatDate(sub.started_at)],
                                                ['Next Billing Date', sub.next_billing_date ? formatDate(sub.next_billing_date) : '—'],
                                            ].map(([label, value]) => (
                                                <div key={label} className="flex items-start justify-between gap-3">
                                                    <dt className="shrink-0 text-muted-foreground">{label}</dt>
                                                    <dd className="min-w-0 text-end font-medium break-words">{value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                        <Separator />
                                        <p className="text-[11px] break-words text-muted-foreground">
                                            {unavailable.payment_methods}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Usage */}
                            <Card className="py-0">
                                <CardContent className="flex flex-col gap-5 p-5">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <span className="text-[12.5px] font-medium">Usage this billing period</span>
                                        {/*
                                          Labelled by the PERIOD, not "this month". The design says
                                          "Usage This Month", but a plan ceiling applies to the term —
                                          on a yearly plan a monthly count against an annual allowance
                                          is a number that means nothing.
                                        */}
                                        <span className="text-[11px] text-muted-foreground">
                                            {formatDate(data?.usage.period_start)} – {formatDate(data?.usage.period_end)}
                                        </span>
                                    </div>
                                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                                        <UsageTile
                                            icon={Calendar} label="Events" tint="bg-violet-500/15 text-violet-600 dark:text-violet-400"
                                            metric={data!.usage.events}
                                        />
                                        <UsageTile
                                            icon={Users} label="Guests" tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                            metric={data!.usage.guests}
                                        />
                                        <UsageTile
                                            icon={Mail} label="Messages Sent" tint="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                            metric={data!.usage.messages}
                                        />
                                        <UsageTile
                                            icon={HardDrive} label="Storage Used" unit="GB"
                                            tint="bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                            metric={data!.usage.storage as never}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    <div className="grid gap-5 md:grid-cols-2">
                        <Card className="py-0">
                            <CardContent className="flex flex-wrap items-center gap-4 p-5">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                                    <Crown className="size-5 text-primary" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">Need more power?</p>
                                    <p className="text-[12.5px] break-words text-muted-foreground">
                                        Compare every plan and switch whenever you like.
                                    </p>
                                </div>
                                <Button asChild size="sm">
                                    <Link href="/dashboard/billing/upgrade">
                                        See plans <ArrowRight className="size-3.5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="py-0">
                            <CardContent className="flex flex-wrap items-center gap-4 p-5">
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
                                    <Headphones className="size-5 text-muted-foreground" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">Need help?</p>
                                    <p className="text-[12.5px] break-words text-muted-foreground">
                                        Questions about your plan or your usage.
                                    </p>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href="/dashboard/billing/contact-sales">Contact us</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── INVOICES ─────────────────────────────────────────────── */}
                <TabsContent value="invoices" className="flex flex-col gap-5">
                    <InvoicesPanel />
                </TabsContent>

                {/* ── PAYMENT METHODS ──────────────────────────────────────── */}
                <TabsContent value="payment">
                    <Card className="py-0">
                        <CardContent className="flex flex-col gap-4 p-6">
                            {/*
                              Not a stub for lack of effort — saving a card needs a
                              payment provider to hold the token, and this project has
                              none. Storing the card number ourselves is the one thing
                              the design's own footnote rules out ("We do not store your
                              card details"), and it would be a PCI problem besides.
                            */}
                            <NotAvailable
                                icon={CreditCard}
                                title="No saved payment methods"
                                reason={unavailable.payment_methods}
                            />
                            <p className="mx-auto max-w-md text-center text-[11px] break-words text-muted-foreground">
                                When online payment is switched on, your card is held by the payment
                                provider — never by us — and appears here.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── BILLING HISTORY ──────────────────────────────────────── */}
                <TabsContent value="history" className="flex flex-col gap-5">
                    <HistoryPanel />
                </TabsContent>

            </Tabs>

            {/* Cancel confirmation */}
            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel your subscription?</DialogTitle>
                        <DialogDescription>
                            {/*
                              States what actually happens. "Cancel" beside a plan name
                              reads as though access stops immediately, and it does not.
                            */}
                            You keep full access until{' '}
                            <span className="font-medium text-foreground">
                                {formatDate(sub?.current_period_end)}
                            </span>
                            . Nothing is charged after that, and you can resume any time before then.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="cancel-reason">Why are you cancelling? (optional)</Label>
                        <Textarea
                            id="cancel-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="This helps us improve."
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelOpen(false)}>
                            Keep my plan
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={cancel.isPending}
                            onClick={() =>
                                cancel.mutate(
                                    { reason: reason.trim() || undefined },
                                    // Closes only on success — on failure the subscription
                                    // is still live and dismissing would imply otherwise.
                                    { onSuccess: () => { setCancelOpen(false); setReason(''); } },
                                )
                            }
                        >
                            {cancel.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                            Cancel subscription
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Invoices
 * ────────────────────────────────────────────────────────────────────────── */

const INVOICE_STATUS_STYLE: Record<string, string> = {
    paid: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    unpaid: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    partially_paid: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    overdue: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    cancelled: 'bg-muted text-muted-foreground',
    refunded: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    draft: 'bg-muted text-muted-foreground',
};

const prettyStatus = (s: string) => s.replace(/_/g, ' ');

/**
 * The Invoices tab.
 *
 * ── THE TILES COUNT THE WHOLE ACCOUNT, NOT THE FILTERED PAGE ────────────────
 * A "Total Invoices" that changes when you type in the search box is not a
 * total. The API computes them over every invoice and returns them beside the
 * filtered page.
 *
 * ── THERE IS NO PAY BUTTON ──────────────────────────────────────────────────
 * `payments_enabled` comes from the API. While it is false the screen says so
 * once, plainly, instead of rendering a disabled Pay control on every row —
 * which reads as a bug rather than as a feature that has not launched.
 */
function InvoicesPanel() {
    const [status, setStatus] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Debounced so typing does not fire a request per keystroke — the same
    // mistake that made the Translations page fire a full scan per character.
    const [debounced, setDebounced] = useState('');
    useEffect(() => {
        const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    const { data, isLoading } = useInvoices({
        status: status === 'all' ? undefined : status,
        search: debounced,
        page,
    });

    const stats = data?.stats;
    const invoices = data?.invoices ?? [];
    const pagination = data?.pagination;

    if (isLoading && !data) {
        return (
            <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <Skeleton className="h-72 rounded-xl" />
            </>
        );
    }

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Total Invoices', value: String(stats?.total_invoices ?? 0), tint: 'bg-violet-500/15 text-violet-600 dark:text-violet-400', icon: FileText },
                    { label: 'Total Amount', value: formatMoney(stats?.total_amount ?? 0), tint: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', icon: Receipt },
                    { label: 'Paid Amount', value: formatMoney(stats?.paid_amount ?? 0), tint: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
                    { label: 'Outstanding', value: formatMoney(stats?.outstanding_amount ?? 0), tint: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', icon: Clock },
                ].map((t) => (
                    <Card key={t.label} className="py-0">
                        <CardContent className="flex items-center gap-3 p-4">
                            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${t.tint}`}>
                                <t.icon className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">{t.label}</p>
                                <p className="text-lg font-semibold break-words">{t.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="py-0">
                <CardContent className="flex flex-col gap-4 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative min-w-[180px] flex-1">
                            <Search className="absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by invoice ID..."
                                className="ps-8"
                            />
                        </div>
                        {/*
                          Only the statuses that actually occur are offered. A filter
                          for "refunded" on an account with no refunds selects nothing
                          and reads as broken.
                        */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {['all', ...Object.keys(stats?.by_status ?? {})].map((s) => (
                                <Button
                                    key={s}
                                    size="sm"
                                    variant={status === s ? 'default' : 'outline'}
                                    onClick={() => { setStatus(s); setPage(1); }}
                                    className="h-8 capitalize"
                                >
                                    {s === 'all' ? 'All' : prettyStatus(s)}
                                    <span className="ms-1 text-[11px] opacity-70">
                                        {s === 'all' ? stats?.total_invoices ?? 0 : stats?.by_status?.[s] ?? 0}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {invoices.length === 0 ? (
                        <NotAvailable
                            icon={FileText}
                            title="No invoices found"
                            reason={
                                debounced || status !== 'all'
                                    ? 'Nothing matches these filters.'
                                    : 'An invoice is raised at the start of each billing term.'
                            }
                        />
                    ) : (
                        <>
                            {/* Scrolls inside its own box — the page must never scroll sideways. */}
                            <div className="w-full overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">Invoice ID</TableHead>
                                            <TableHead className="min-w-[110px]">Date</TableHead>
                                            <TableHead className="min-w-[110px] text-end">Amount</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[80px] text-end">View</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="max-w-[200px] font-medium break-all">
                                                    {inv.invoice_number}
                                                </TableCell>
                                                <TableCell className="text-[12.5px] whitespace-nowrap">
                                                    {formatDate(inv.issue_date)}
                                                </TableCell>
                                                <TableCell className="text-end tabular-nums whitespace-nowrap">
                                                    {formatMoney(inv.total, inv.currency_code)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="ghost"
                                                        className={`${INVOICE_STATUS_STYLE[inv.status] ?? 'bg-muted text-muted-foreground'} capitalize`}
                                                    >
                                                        {prettyStatus(inv.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-end">
                                                    <Button asChild size="sm" variant="ghost">
                                                        <Link href={`/dashboard/billing/invoices/${inv.id}`}>
                                                            <ArrowRight className="size-3.5" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {pagination && pagination.totalPages > 1 ? (
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[11px] text-muted-foreground">
                                        Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} invoices
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" disabled={page <= 1}
                                            onClick={() => setPage((p) => p - 1)}>Previous</Button>
                                        <Button size="sm" variant="outline" disabled={page >= pagination.totalPages}
                                            onClick={() => setPage((p) => p + 1)}>Next</Button>
                                    </div>
                                </div>
                            ) : null}
                        </>
                    )}

                    {data && !data.payments_enabled && data.payments_reason ? (
                        <p className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-[11px] break-words text-muted-foreground">
                            <Info className="mt-0.5 size-3.5 shrink-0" />
                            {data.payments_reason}
                        </p>
                    ) : null}
                </CardContent>
            </Card>
        </>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Billing history
 * ────────────────────────────────────────────────────────────────────────── */

const TX_TYPE_STYLE: Record<string, string> = {
    payment: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    invoice: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    refund: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    setup: 'bg-muted text-muted-foreground',
    adjustment: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
};

/**
 * The Billing History tab.
 *
 * Rows are the money ledger MERGED with the subscription lifecycle log,
 * server-side — the design's own table mixes "Payment for INV-…" with
 * "Subscription created", and they live in two tables because they are two
 * kinds of fact.
 *
 * An amount of `null` renders as an em dash, never ₹0.00: a plan change is not
 * a zero-rupee transaction, and printing one would be a claim about money that
 * never moved.
 */
function HistoryPanel() {
    const [type, setType] = useState('all');
    const [page, setPage] = useState(1);
    const { data, isLoading } = useBillingHistory({ type, page });

    const rows = data?.transactions ?? [];
    const summary = data?.summary ?? {};
    const pagination = data?.pagination;

    if (isLoading && !data) return <Skeleton className="h-72 rounded-xl" />;

    return (
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
            <Card className="py-0">
                <CardContent className="flex flex-col gap-4 p-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {['all', 'invoice', 'payment', 'refund', 'setup'].map((t) => (
                            <Button
                                key={t}
                                size="sm"
                                variant={type === t ? 'default' : 'outline'}
                                onClick={() => { setType(t); setPage(1); }}
                                className="h-8 capitalize"
                            >
                                {t}
                                <span className="ms-1 text-[11px] opacity-70">{summary[t] ?? 0}</span>
                            </Button>
                        ))}
                    </div>

                    {rows.length === 0 ? (
                        <NotAvailable
                            icon={Info}
                            title="Nothing here yet"
                            reason={
                                type === 'all'
                                    ? 'Your billing activity will appear here.'
                                    : `No ${type} activity on this account.`
                            }
                        />
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[110px]">Date</TableHead>
                                        <TableHead className="min-w-[200px]">Description</TableHead>
                                        <TableHead className="min-w-[90px]">Type</TableHead>
                                        <TableHead className="min-w-[110px] text-end">Amount</TableHead>
                                        <TableHead className="min-w-[130px]">Reference</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((r) => (
                                        <TableRow key={r.key}>
                                            <TableCell className="text-[12.5px] whitespace-nowrap">
                                                {formatDate(r.occurred_at)}
                                            </TableCell>
                                            {/* break-words, never truncate: auto-layout table. */}
                                            <TableCell className="max-w-[320px] text-[12.5px] break-words">
                                                {r.description ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="ghost"
                                                    className={`${TX_TYPE_STYLE[r.type] ?? 'bg-muted text-muted-foreground'} capitalize`}
                                                >
                                                    {r.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-end tabular-nums whitespace-nowrap">
                                                {r.amount === null
                                                    ? <span className="text-muted-foreground">—</span>
                                                    : (
                                                        <span className={r.amount < 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                                                            {formatMoney(r.amount, r.currency_code ?? 'INR')}
                                                        </span>
                                                    )}
                                            </TableCell>
                                            <TableCell className="max-w-[180px] text-[12.5px] break-all">
                                                {r.invoice_id && r.invoice_number ? (
                                                    <Link
                                                        href={`/dashboard/billing/invoices/${r.invoice_id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {r.invoice_number}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {pagination && pagination.totalPages > 1 ? (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} entries
                            </span>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}>Previous</Button>
                                <Button size="sm" variant="outline" disabled={page >= pagination.totalPages}
                                    onClick={() => setPage((p) => p + 1)}>Next</Button>
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="py-0 xl:self-start">
                <CardContent className="flex flex-col gap-3 p-5">
                    <span className="text-[12.5px] font-medium">Activity summary</span>
                    <dl className="flex flex-col gap-2 text-[12.5px]">
                        {[
                            ['All activity', summary.all ?? 0],
                            ['Invoices', summary.invoice ?? 0],
                            ['Payments', summary.payment ?? 0],
                            ['Refunds', summary.refund ?? 0],
                            ['Setup', summary.setup ?? 0],
                        ].map(([label, value]) => (
                            <div key={String(label)} className="flex items-center justify-between gap-3">
                                <dt className="text-muted-foreground">{label}</dt>
                                <dd className="font-medium tabular-nums">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    {data?.note ? (
                        <>
                            <Separator />
                            <p className="text-[11px] break-words text-muted-foreground">{data.note}</p>
                        </>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
