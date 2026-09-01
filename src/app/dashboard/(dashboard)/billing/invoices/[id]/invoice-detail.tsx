'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    ArrowLeft, Printer, Info, CheckCircle2, Clock, FileText, Receipt,
    Share2, History, Headphones, Pencil, Calendar, Users, Mail, HardDrive,
    CreditCard, ArrowRight, Ban,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
    useInvoice, formatMoney, formatDate,
    type Invoice, type BillingUsage, type UsageMetric,
} from '@/hooks/use-billing';
import { useDateFormatter } from '@/hooks/use-client-settings';

/**
 * One invoice.
 *
 * ── "DOWNLOAD PDF" IS PRINT, DELIBERATELY ───────────────────────────────────
 * The design has a Download Invoice (PDF) action. Generating a real PDF needs a
 * renderer neither the backend nor this app has, and a button that produced a
 * screenshot-quality image instead would be worse than the honest thing: the
 * browser's own print-to-PDF makes a genuine, selectable, archival PDF out of
 * this exact markup. The button says so under its own label.
 *
 * ── ⚠ THE PRINT RULE HIDES THE APP, NOT JUST THE BUTTONS ────────────────────
 * The first version only carried `print:hidden` on this page's own chrome, so
 * printing still swept in the sidebar, the header and the breadcrumb from the
 * dashboard LAYOUT — two pages, one of them the app. Those elements are not
 * this component's to class, so the rule works the other way round: everything
 * is hidden, and visibility is restored inside `#invoice-print` only.
 *
 * `visibility` rather than `display` is the point — a hidden ANCESTOR still
 * lays its descendants out, so the invoice keeps its position instead of
 * collapsing with the sidebar.
 *
 * ── THREE ACTIONS THE DESIGN ASKS FOR THAT ARE NOT BUILT AS DRAWN ───────────
 * Download Credit Note (no credit-note concept exists anywhere in this system),
 * Download Receipt (a receipt needs a payment, and payments are disabled), and
 * Share Invoice (invoices are auth-scoped, so a shared link 404s for anyone not
 * signed in to this account). Each says so where it would have been, rather
 * than being a control that fails when pressed.
 */

const STATUS_STYLE: Record<string, string> = {
    paid: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    unpaid: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    partially_paid: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    overdue: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    cancelled: 'bg-muted text-muted-foreground',
    refunded: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    draft: 'bg-muted text-muted-foreground',
};

/**
 * Print.
 *
 * `@page` sets the paper margin, so the document does not need padding that
 * would also show on screen. Colour adjust is exact because the status badge
 * and the timeline ticks carry meaning — a greyed-out tick reads as pending.
 */
const PRINT_CSS = `
@media print {
    /* Everything goes; the invoice comes back. 'visibility' rather than
       'display' on the app chrome, so nothing above reflows on its way out. */
    body * { visibility: hidden !important; }
    #invoice-print, #invoice-print * { visibility: visible !important; }

    /*
      ⚠ THE ALIGNMENT FIX. Hiding the chrome is not enough — the invoice still
      sat inside the dashboard's own box: SidebarInset is positioned and follows
      the sidebar in a flex row, and the content wrapper carries lg:px-8. So the
      printed page came out indented by a sidebar that was not there and about
      half the paper wide, which clipped the Qty and Amount columns off the
      items table.

      \'*:has(#invoice-print)\' selects exactly the ancestor chain and nothing
      else, and flattens every one of them: no positioning, no padding, no width
      cap, no flex track. That is why the invoice can then just be a normal
      static block — no absolute positioning, which is what made it resolve
      against SidebarInset in the first place.
    */
    *:has(#invoice-print) {
        display: block !important;
        position: static !important;
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: visible !important;
        transform: none !important;
        background: transparent !important;
    }
    #invoice-print { display: block !important; width: 100% !important; }

    /* The items table scrolls inside its own box on screen. On paper there is
       nothing to scroll, and clipping it loses columns. */
    #invoice-print .overflow-x-auto { overflow: visible !important; }
    #invoice-print table { width: 100% !important; table-layout: auto !important; }

    /* Paper is one column. The rail's cards follow the invoice rather than
       sitting beside it in a 320px track that A4 has no room for. */
    #invoice-print .invoice-cols { display: block !important; }
    #invoice-print .invoice-cols > * + * { margin-top: 1.25rem; }

    #invoice-print [data-slot="card"] {
        border: 0 !important;
        box-shadow: none !important;
        break-inside: avoid;
        background: transparent !important;
    }
    .no-print { display: none !important; }
    html, body {
        background: #fff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
@page { margin: 12mm; }
`;

export default function InvoiceDetail({ invoiceId }: { invoiceId: number }) {
    const { data, isLoading, isError } = useInvoice(invoiceId);
    const fmt = useDateFormatter();
    const [copied, setCopied] = useState(false);

    const invoice = data?.invoice;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5 p-4 md:p-6">
                <Skeleton className="h-8 w-56" />
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <Skeleton className="h-96 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        );
    }

    // Owner-scoped on the server, so "not found" and "not yours" are the same
    // screen on purpose — distinguishing them would confirm that an invoice
    // number exists on somebody else's account.
    if (isError || !invoice) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
                <p className="text-sm font-medium">Invoice not found</p>
                <p className="text-[12.5px] text-muted-foreground">
                    This invoice does not exist, or it is not on your account.
                </p>
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/billing">Back to Billing</Link>
                </Button>
            </div>
        );
    }

    const paid = invoice.status === 'paid';
    const settled = invoice.amount_paid > 0;
    const method = invoice.payment_method ?? null;

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success('Invoice link copied.');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy the link.');
        }
    }

    return (
        <div className="flex min-w-0 flex-col gap-5 p-4 md:p-6">
            <style>{PRINT_CSS}</style>

            <div className="no-print flex flex-wrap items-center gap-3">
                <Button asChild variant="ghost" size="sm" className="-ms-2 text-muted-foreground">
                    <Link href="/dashboard/billing?tab=invoices">
                        <ArrowLeft className="size-3.5" /> Back to Invoices
                    </Link>
                </Button>
                <Button size="sm" variant="outline" className="ms-auto" onClick={() => window.print()}>
                    <Printer className="size-3.5" /> Print / Save as PDF
                </Button>
            </div>

            <div id="invoice-print" className="flex min-w-0 flex-col gap-5">
                {/* ── Title ────────────────────────────────────────────────── */}
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold break-all">
                            Invoice {invoice.invoice_number}
                        </h1>
                        <Badge
                            variant="ghost"
                            className={`${STATUS_STYLE[invoice.status] ?? 'bg-muted text-muted-foreground'} capitalize`}
                        >
                            {invoice.status.replace(/_/g, ' ')}
                        </Badge>
                    </div>
                    <p className="text-[12.5px] break-words text-muted-foreground">
                        {invoice.paid_at
                            ? `Paid on ${fmt(invoice.paid_at, true)}`
                            : `Issued ${formatDate(invoice.issue_date)}`}
                        {invoice.period_start
                            ? ` · covers ${formatDate(invoice.period_start)} – ${formatDate(invoice.period_end)}`
                            : ''}
                    </p>
                </div>

                <div className="invoice-cols grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    {/* ── Left ─────────────────────────────────────────────── */}
                    <div className="flex min-w-0 flex-col gap-5">
                        <Card className="py-0">
                            <CardContent className="grid min-w-0 gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                                <div className="flex min-w-0 flex-col justify-center gap-1.5">
                                    <span className="text-[11.5px] text-muted-foreground">
                                        {paid ? 'Amount paid' : 'Amount due'}
                                    </span>
                                    <p className="flex flex-wrap items-baseline gap-1.5">
                                        <span className="text-3xl font-semibold break-words">
                                            {formatMoney(paid ? invoice.amount_paid : invoice.amount_due, invoice.currency_code)}
                                        </span>
                                        <span className="text-[12px] text-muted-foreground">
                                            ({invoice.currency_code})
                                        </span>
                                    </p>
                                    {/*
                                      Computed on the server with Indian grouping, so the
                                      words and the figure can never disagree. Null for a
                                      non-INR invoice, which has no rupees/paise reading.
                                    */}
                                    {invoice.amount_in_words ? (
                                        <p className="text-[12px] break-words text-muted-foreground">
                                            {invoice.amount_in_words}
                                        </p>
                                    ) : null}
                                </div>

                                <dl className="flex min-w-0 flex-col gap-2.5 text-[12.5px]">
                                    <MetaRow label="Invoice ID" value={invoice.invoice_number} mono />
                                    <MetaRow label="Invoice date" value={formatDate(invoice.issue_date)} />
                                    <MetaRow
                                        label="Billing period"
                                        value={invoice.period_start
                                            ? `${formatDate(invoice.period_start)} – ${formatDate(invoice.period_end)}`
                                            : '—'}
                                    />
                                    {/*
                                      No due date is stamped while payments are disabled —
                                      an invoice nobody can pay must not be shown as
                                      overdue, which would be blaming the client for our
                                      missing integration.
                                    */}
                                    <MetaRow
                                        label="Due date"
                                        value={invoice.due_date ? formatDate(invoice.due_date) : '—'}
                                    />
                                    <MetaRow label="Plan" value={invoice.plan?.name ?? '—'} />
                                    <MetaRow
                                        label="Payment date"
                                        value={invoice.paid_at ? fmt(invoice.paid_at, true) : '—'}
                                    />
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="shrink-0 text-muted-foreground">Payment method</dt>
                                        <dd className="min-w-0">
                                            {method ? (
                                                <span className="flex items-center gap-2">
                                                    <CardBrand brand={method.brand} />
                                                    <span className="font-medium tabular-nums">
                                                        &bull;&bull;&bull;&bull; {method.last4 ?? '----'}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* ── Items ────────────────────────────────────────── */}
                        <Card className="py-0">
                            <CardContent className="flex min-w-0 flex-col gap-4 p-5">
                                <span className="text-[13px] font-semibold">Invoice Items</span>

                                <div className="w-full overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[200px]">Item</TableHead>
                                                <TableHead className="min-w-[170px]">Description</TableHead>
                                                <TableHead className="min-w-[90px] text-end">Qty</TableHead>
                                                <TableHead className="min-w-[110px] text-end">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(invoice.items ?? []).map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="max-w-[300px] text-[12.5px] font-medium break-words">
                                                        {item.description}
                                                    </TableCell>
                                                    <TableCell className="text-[12.5px] break-words text-muted-foreground">
                                                        {item.period_start
                                                            ? `${formatDate(item.period_start)} – ${formatDate(item.period_end)}`
                                                            : '—'}
                                                    </TableCell>
                                                    <TableCell className="text-end tabular-nums">{item.quantity}</TableCell>
                                                    <TableCell className="text-end tabular-nums whitespace-nowrap">
                                                        {formatMoney(item.amount, invoice.currency_code)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <Totals invoice={invoice} />

                                {invoice.notes ? (
                                    <p className="flex min-w-0 items-start gap-2 rounded-lg border bg-muted/40 px-3.5 py-2.5 text-[11.5px] break-words text-muted-foreground">
                                        <Info className="mt-0.5 size-3.5 shrink-0" />
                                        {invoice.notes}
                                    </p>
                                ) : null}
                            </CardContent>
                        </Card>

                        {/* ── Usage ────────────────────────────────────────── */}
                        {data?.usage ? <UsageCard usage={data.usage} /> : null}

                        {/* ── Timeline ─────────────────────────────────────── */}
                        <TimelineCard invoice={invoice} fmt={fmt} />
                    </div>

                    {/* ── Rail ─────────────────────────────────────────────── */}
                    <div className="flex min-w-0 flex-col gap-5">
                        <Card className="no-print py-0">
                            <CardContent className="flex flex-col gap-1 p-5">
                                <span className="mb-2 text-[13px] font-semibold">Actions</span>

                                <ActionRow
                                    icon={FileText}
                                    label="Download Invoice (PDF)"
                                    note="Opens your browser's print dialog — choose Save as PDF."
                                    onClick={() => window.print()}
                                />

                                {/*
                                  A receipt acknowledges money received. Until a payment
                                  is recorded there is nothing to acknowledge, so this
                                  says what it is waiting for rather than producing a
                                  document that asserts a payment that never happened.
                                */}
                                <ActionRow
                                    icon={Receipt}
                                    label="Download Receipt"
                                    note={settled
                                        ? 'Prints this invoice, which records the payment.'
                                        : 'Available once a payment is recorded against this invoice.'}
                                    disabled={!settled}
                                    onClick={() => window.print()}
                                />

                                {/*
                                  Copy, not "share": an invoice is auth-scoped, so the
                                  link 404s for anybody not signed in to this account.
                                  The note says so instead of the recipient finding out.
                                */}
                                <ActionRow
                                    icon={Share2}
                                    label={copied ? 'Link copied' : 'Copy invoice link'}
                                    note="Only someone signed in to this account can open it."
                                    onClick={copyLink}
                                />

                                <ActionRow
                                    icon={History}
                                    label="View Billing History"
                                    href="/dashboard/billing?tab=history"
                                />

                                <Separator className="my-2" />

                                {/*
                                  The design's "Download Credit Note · New". There is no
                                  credit note anywhere in this system — no table, no
                                  numbering series, no route. Named here so the omission
                                  is visible rather than looking like an oversight.
                                */}
                                <p className="flex min-w-0 items-start gap-2 text-[11px] break-words text-muted-foreground">
                                    <Ban className="mt-0.5 size-3 shrink-0" />
                                    Credit notes are not issued by this system, so there is none
                                    to download for this invoice.
                                </p>
                            </CardContent>
                        </Card>

                        {/* ── Bill to ──────────────────────────────────────── */}
                        <Card className="py-0">
                            <CardContent className="flex min-w-0 flex-col gap-3 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[13px] font-semibold">Bill To</span>
                                    <Link
                                        href="/dashboard/profile"
                                        className="no-print text-[12px] font-medium text-primary hover:underline"
                                    >
                                        <Pencil className="me-1 inline size-3" />Edit
                                    </Link>
                                </div>

                                <div className="flex min-w-0 flex-col gap-1 text-[12.5px]">
                                    <span className="font-medium break-words">{invoice.billing_name ?? '—'}</span>
                                    {invoice.billing_address ? (
                                        <span className="break-words whitespace-pre-line text-muted-foreground">
                                            {invoice.billing_address}
                                        </span>
                                    ) : (
                                        /*
                                          website_clients has no address columns at all, so
                                          this is genuinely absent rather than merely blank.
                                        */
                                        <span className="text-[11px] text-muted-foreground/70">
                                            No billing address on file
                                        </span>
                                    )}
                                    {invoice.billing_email ? (
                                        <span className="break-all text-muted-foreground">{invoice.billing_email}</span>
                                    ) : null}
                                    {invoice.billing_gstin ? (
                                        <span className="break-words text-muted-foreground">
                                            GSTIN: {invoice.billing_gstin}
                                        </span>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── Payment summary ──────────────────────────────── */}
                        <Card className="py-0">
                            <CardContent className="flex min-w-0 flex-col gap-3 p-5">
                                <span className="text-[13px] font-semibold">Payment Summary</span>

                                {settled ? (
                                    <p className="flex items-center gap-2 text-[12.5px] font-medium text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="size-4 shrink-0" />
                                        {paid ? 'Payment successful' : 'Partially paid'}
                                    </p>
                                ) : (
                                    <p className="flex items-start gap-2 text-[12.5px] break-words text-muted-foreground">
                                        <Clock className="mt-0.5 size-4 shrink-0" />
                                        {data?.payments_reason ?? 'No payment has been recorded yet.'}
                                    </p>
                                )}

                                <dl className="flex flex-col gap-2.5 text-[12.5px]">
                                    <MetaRow
                                        label="Amount paid"
                                        value={formatMoney(invoice.amount_paid, invoice.currency_code)}
                                    />
                                    <MetaRow
                                        label="Amount due"
                                        value={formatMoney(invoice.amount_due, invoice.currency_code)}
                                    />
                                    <MetaRow
                                        label="Transaction ID"
                                        value={method?.gateway_transaction_id ?? '—'}
                                        mono
                                    />
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="shrink-0 text-muted-foreground">Payment method</dt>
                                        <dd className="min-w-0">
                                            {method ? (
                                                <span className="flex items-center gap-2">
                                                    <CardBrand brand={method.brand} />
                                                    <span className="font-medium tabular-nums">
                                                        &bull;&bull;&bull;&bull; {method.last4 ?? '----'}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </dd>
                                    </div>
                                    <MetaRow
                                        label="Paid on"
                                        value={invoice.paid_at ? fmt(invoice.paid_at, true) : '—'}
                                    />
                                </dl>
                            </CardContent>
                        </Card>

                        <Card className="no-print py-0">
                            <CardContent className="flex flex-col gap-3 p-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
                                        <Headphones className="size-4 text-muted-foreground" />
                                    </span>
                                    <span className="text-[13px] font-semibold">Need help?</span>
                                </div>
                                <p className="text-[12px] break-words text-muted-foreground">
                                    Questions about this invoice or a payment.
                                </p>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link href="/dashboard/billing/contact-sales">Contact us</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {data && !data.payments_enabled ? (
                <p className="no-print flex min-w-0 items-start gap-2 rounded-lg border bg-muted/40 px-3.5 py-2.5 text-[11.5px] break-words text-muted-foreground">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    {data.payments_reason}
                </p>
            ) : null}
        </div>
    );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className={`min-w-0 text-end font-medium break-words ${mono ? 'tabular-nums' : ''}`}>
                {value}
            </dd>
        </div>
    );
}

/**
 * The brand block. Text, not a logo file — shipping Visa/Mastercard artwork
 * means licensing their marks, and a stretched logo looks worse than a clean
 * label. Same treatment as the Payment Methods screen.
 */
function CardBrand({ brand }: { brand: string | null }) {
    return (
        <span className="grid h-6 w-9 shrink-0 place-items-center rounded border bg-muted text-[8px] font-bold tracking-wide uppercase">
            {brand ? brand.slice(0, 6) : <CreditCard className="size-3 text-muted-foreground" />}
        </span>
    );
}

function ActionRow({ icon: Icon, label, note, href, onClick, disabled }: {
    icon: React.ElementType;
    label: string;
    note?: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
}) {
    const body = (
        <>
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium break-words">{label}</span>
                {note ? (
                    <span className="mt-0.5 block text-[11px] break-words text-muted-foreground">
                        {note}
                    </span>
                ) : null}
            </span>
            {href ? <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /> : null}
        </>
    );

    const cls = `flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-start transition-colors ${
        disabled ? 'cursor-not-allowed opacity-55' : 'hover:bg-muted'
    }`;

    if (href) return <Link href={href} className={cls}>{body}</Link>;

    return (
        <button type="button" className={cls} disabled={disabled} onClick={onClick}>
            {body}
        </button>
    );
}

function Totals({ invoice }: { invoice: Invoice }) {
    return (
        <div className="flex justify-end">
            <dl className="flex w-full max-w-xs flex-col gap-2 text-[12.5px]">
                <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{formatMoney(invoice.subtotal, invoice.currency_code)}</dd>
                </div>
                {invoice.discount_amount > 0 ? (
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Discount</dt>
                        <dd className="tabular-nums text-emerald-600 dark:text-emerald-400">
                            −{formatMoney(invoice.discount_amount, invoice.currency_code)}
                        </dd>
                    </div>
                ) : null}
                {/*
                  Rendered from the stored breakdown, not recomputed here. The
                  components sum EXACTLY to tax_amount — the supplied mockup printed
                  CGST and SGST and then never added them to its own total, which is
                  what made its invoice fail to reconcile.
                */}
                {invoice.tax_breakdown.map((t) => (
                    <div key={t.label} className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">{t.label} ({t.rate}%)</dt>
                        <dd className="tabular-nums">{formatMoney(t.amount, invoice.currency_code)}</dd>
                    </div>
                ))}
                <Separator />
                <div className="flex justify-between gap-4 text-sm font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatMoney(invoice.total, invoice.currency_code)}</dd>
                </div>
                {invoice.amount_paid > 0 ? (
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Paid</dt>
                        <dd className="tabular-nums">{formatMoney(invoice.amount_paid, invoice.currency_code)}</dd>
                    </div>
                ) : null}
                <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Amount due</dt>
                    <dd className="font-medium tabular-nums">
                        {formatMoney(invoice.amount_due, invoice.currency_code)}
                    </dd>
                </div>
                <span className="text-[11px] text-muted-foreground">
                    {invoice.tax_inclusive
                        ? 'Prices include tax.'
                        : 'Tax is added on top of the subtotal.'}
                </span>
            </dl>
        </div>
    );
}

/**
 * Usage for THIS INVOICE'S period, not the current one.
 *
 * An invoice records a past term, and today's numbers printed under last
 * month's dates would be a different fact wearing the same label. The period is
 * on the heading so the two can be checked against each other.
 */
function UsageCard({ usage }: { usage: BillingUsage }) {
    return (
        <Card className="py-0">
            <CardContent className="flex min-w-0 flex-col gap-4 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold">Usage Summary</span>
                    <span className="text-[11px] text-muted-foreground">
                        {formatDate(usage.period_start)} – {formatDate(usage.period_end)}
                    </span>
                </div>

                <div className="flex flex-col gap-3">
                    <UsageRow
                        icon={Calendar} label="Events"
                        tint="bg-violet-500/15 text-violet-600 dark:text-violet-400"
                        metric={usage.events}
                    />
                    <UsageRow
                        icon={Users} label="Guests"
                        tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        metric={usage.guests}
                    />
                    <UsageRow
                        icon={Mail} label="Messages Sent"
                        tint="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        metric={usage.messages}
                    />
                    <UsageRow
                        icon={HardDrive} label="Storage Used" unit="GB"
                        tint="bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        metric={{
                            used: usage.storage.used_gb,
                            limit: usage.storage.limit_gb,
                            available: usage.storage.available,
                            reason: usage.storage.reason,
                        }}
                    />
                </div>

                <Link
                    href="/dashboard/analytics"
                    className="no-print inline-flex w-fit items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
                >
                    View detailed usage <ArrowRight className="size-3.5" />
                </Link>
            </CardContent>
        </Card>
    );
}

/**
 * One usage line.
 *
 * `available: false` means the number is UNKNOWN, not zero, and renders an em
 * dash with the reason. A 0 and an unbuilt feature look identical on a tile and
 * mean opposite things — storage is the case that matters, since its ceiling is
 * known and nothing measures the numerator.
 */
function UsageRow({ icon: Icon, label, metric, unit, tint }: {
    icon: React.ElementType;
    label: string;
    metric: UsageMetric;
    unit?: string;
    tint: string;
}) {
    const used = metric.used;
    const limit = metric.limit;
    const known = metric.available && used !== null && used !== undefined;
    const pct = known && limit ? Math.min(100, Math.round((Number(used) / limit) * 100)) : null;
    const over = known && limit !== null && Number(used) > limit;

    return (
        <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tint}`}>
                <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1 text-[12.5px] break-words">{label}</span>

            <div className="flex min-w-0 shrink-0 flex-col items-end gap-1">
                <span className="text-[13px] font-semibold tabular-nums">
                    {known ? Number(used).toLocaleString('en-IN') : '—'}
                    {known && unit ? ` ${unit}` : ''}
                    {limit !== null && limit !== undefined ? (
                        <span className="ms-1 text-[11px] font-normal text-muted-foreground">
                            / {limit.toLocaleString('en-IN')}{unit ? ` ${unit}` : ''}
                        </span>
                    ) : null}
                </span>
                {pct !== null ? (
                    <div className="flex w-[130px] items-center gap-2">
                        <Progress value={pct} className={over ? 'h-1.5 [&>*]:bg-rose-500' : 'h-1.5'} />
                        <span className={`shrink-0 text-[10.5px] tabular-nums ${over ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                            {pct}%
                        </span>
                    </div>
                ) : (
                    <span className="max-w-[190px] text-end text-[10.5px] break-words text-muted-foreground">
                        {metric.available ? 'No limit set' : metric.reason ?? 'Not measured yet'}
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * The timeline.
 *
 * DERIVED from real timestamps on the server, never stored — only events that
 * actually happened appear. A greyed-out "awaiting payment" step, as the mockup
 * draws it, reads as stuck rather than as not started.
 */
function TimelineCard({ invoice, fmt }: {
    invoice: Invoice;
    fmt: (v: string | null | undefined, withTime?: boolean) => string;
}) {
    const entries = invoice.timeline ?? [];
    if (!entries.length) return null;

    return (
        <Card className="py-0">
            <CardContent className="flex min-w-0 flex-col gap-4 p-5">
                <span className="text-[13px] font-semibold">Invoice Timeline</span>

                <ol className="flex flex-col">
                    {entries.map((e, i) => (
                        <li key={e.key} className="flex min-w-0 gap-3">
                            <div className="flex shrink-0 flex-col items-center">
                                <CheckCircle2 className="size-4 text-emerald-500" />
                                {i < entries.length - 1 ? (
                                    <span className="w-px flex-1 bg-border" />
                                ) : null}
                            </div>
                            <div className="min-w-0 flex-1 pb-5 last:pb-0">
                                <p className="text-[12.5px] font-medium break-words">{e.label}</p>
                                <p className="text-[11px] text-muted-foreground">{fmt(e.at, true)}</p>
                                {e.detail ? (
                                    <p className="mt-0.5 text-[11.5px] break-words text-muted-foreground">
                                        {e.detail}
                                    </p>
                                ) : null}
                            </div>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
}
