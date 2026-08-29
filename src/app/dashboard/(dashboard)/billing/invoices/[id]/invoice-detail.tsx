'use client';

import Link from 'next/link';
import { ArrowLeft, Printer, Info, CheckCircle2, Clock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useInvoice, formatMoney, formatDate } from '@/hooks/use-billing';

/**
 * One invoice.
 *
 * ── "DOWNLOAD PDF" IS PRINT, DELIBERATELY ───────────────────────────────────
 * The design has a Download Invoice (PDF) action. Generating a real PDF needs a
 * renderer neither the backend nor this app has, and shipping a button that
 * produces a screenshot-quality image instead would be worse than the honest
 * thing: the browser's own print-to-PDF produces a genuine, selectable,
 * archival PDF from this exact markup.
 *
 * The print stylesheet is inline and scoped, so it cannot leak into the rest of
 * the portal.
 *
 * ── THERE IS NO PAY BUTTON ──────────────────────────────────────────────────
 * `payments_enabled` comes from the API. While it is false the invoice says how
 * to settle instead of rendering a control that cannot work.
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

export default function InvoiceDetail({ invoiceId }: { invoiceId: number }) {
    const { data, isLoading, isError } = useInvoice(invoiceId);
    const invoice = data?.invoice;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5 p-4 md:p-6">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-96 rounded-xl" />
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

    const paidish = invoice.status === 'paid';

    return (
        <div className="flex min-w-0 flex-col gap-5 p-4 md:p-6">
            {/*
              Scoped to this page: `print:hidden` on the chrome, and the card
              flattened so it prints as a document rather than as a screenshot
              of a UI. Inline because it applies to one route only.
            */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-flat { border: 0 !important; box-shadow: none !important; }
                    body { background: #fff !important; }
                }
            `}</style>

            <div className="no-print flex flex-wrap items-center gap-3">
                <Button asChild variant="ghost" size="sm" className="-ms-2 text-muted-foreground">
                    <Link href="/dashboard/billing"><ArrowLeft className="size-3.5" /> Back to Billing</Link>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="ms-auto"
                    onClick={() => window.print()}
                >
                    <Printer className="size-3.5" /> Print / Save as PDF
                </Button>
            </div>

            <Card className="print-flat py-0">
                <CardContent className="flex flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
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
                            <p className="mt-1 text-[12.5px] text-muted-foreground">
                                Issued {formatDate(invoice.issue_date)}
                                {invoice.period_start
                                    ? ` · covers ${formatDate(invoice.period_start)} – ${formatDate(invoice.period_end)}`
                                    : ''}
                            </p>
                        </div>
                        <div className="text-end">
                            <p className="text-[11px] text-muted-foreground">
                                {paidish ? 'Amount paid' : 'Amount due'}
                            </p>
                            <p className="text-2xl font-semibold">
                                {formatMoney(paidish ? invoice.amount_paid : invoice.amount_due, invoice.currency_code)}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Bill to / meta */}
                    <div className="grid min-w-0 gap-6 sm:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <span className="text-[11px] font-medium text-muted-foreground">Bill to</span>
                            <span className="text-sm font-medium break-words">
                                {invoice.billing_name ?? '—'}
                            </span>
                            {invoice.billing_email ? (
                                <span className="text-[12.5px] break-all text-muted-foreground">
                                    {invoice.billing_email}
                                </span>
                            ) : null}
                            {invoice.billing_address ? (
                                <span className="text-[12.5px] break-words whitespace-pre-line text-muted-foreground">
                                    {invoice.billing_address}
                                </span>
                            ) : (
                                /*
                                  website_clients has no address columns at all, so
                                  this is genuinely absent rather than merely blank.
                                  Said plainly instead of printing an empty line.
                                */
                                <span className="text-[11px] text-muted-foreground/70">
                                    No billing address on file
                                </span>
                            )}
                            {invoice.billing_gstin ? (
                                <span className="text-[12.5px] text-muted-foreground">
                                    GSTIN: {invoice.billing_gstin}
                                </span>
                            ) : null}
                        </div>

                        <dl className="flex flex-col gap-2 text-[12.5px] sm:text-end">
                            {[
                                ['Invoice ID', invoice.invoice_number],
                                ['Invoice date', formatDate(invoice.issue_date)],
                                ['Due date', invoice.due_date ? formatDate(invoice.due_date) : '—'],
                                ['Plan', invoice.plan?.name ?? '—'],
                                ['Payment date', invoice.paid_at ? formatDate(invoice.paid_at) : '—'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-start justify-between gap-3 sm:justify-end sm:gap-6">
                                    <dt className="text-muted-foreground">{label}</dt>
                                    <dd className="min-w-0 font-medium break-words">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Items */}
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Item</TableHead>
                                    <TableHead className="min-w-[160px]">Period</TableHead>
                                    <TableHead className="min-w-[70px] text-end">Qty</TableHead>
                                    <TableHead className="min-w-[110px] text-end">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(invoice.items ?? []).map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="max-w-[320px] text-[12.5px] break-words">
                                            {item.description}
                                        </TableCell>
                                        <TableCell className="text-[12.5px] whitespace-nowrap text-muted-foreground">
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

                    {/* Totals */}
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
                              Rendered from the stored breakdown, not recomputed here.
                              The components sum EXACTLY to tax_amount — the supplied
                              mockup printed CGST and SGST and then never added them
                              to its own total, which is what made its invoice fail
                              to reconcile.
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
                                <dd className="tabular-nums font-medium">
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

                    {/* Ledger */}
                    {invoice.transactions?.length ? (
                        <>
                            <Separator />
                            <div className="flex flex-col gap-2">
                                <span className="text-[12.5px] font-medium">Invoice timeline</span>
                                <ul className="flex flex-col gap-2">
                                    {invoice.transactions.map((t) => (
                                        <li key={t.id} className="flex flex-wrap items-center gap-2 text-[12.5px]">
                                            {t.type === 'payment'
                                                ? <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                                                : <Clock className="size-3.5 shrink-0 text-muted-foreground" />}
                                            <span className="min-w-0 break-words">{t.description}</span>
                                            <span className="ms-auto shrink-0 text-muted-foreground">
                                                {formatDate(t.occurred_at)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : null}

                    {data && !data.payments_enabled ? (
                        <p className="no-print flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-[11px] break-words text-muted-foreground">
                            <Info className="mt-0.5 size-3.5 shrink-0" />
                            {data.payments_reason}
                        </p>
                    ) : null}

                    {invoice.notes ? (
                        <p className="text-[11px] break-words text-muted-foreground">{invoice.notes}</p>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
