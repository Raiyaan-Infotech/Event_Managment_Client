'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Minus, Info } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useBillingPlans, formatMoney, CYCLE_SUFFIX } from '@/hooks/use-billing';

/**
 * All Features — the full comparison matrix.
 *
 * ── THE ROWS ARE REAL, WHICH IS WHY THEY DIFFER FROM THE MOCKUP ─────────────
 * Every row is a module a plan genuinely grants, read from
 * `subscription_plan_menus`. A tick means that plan actually includes it.
 *
 * The design's own rows — Team Members & Roles, API Access, SSO, Custom
 * Branding, Role-based Access, White-label — name entitlements that exist
 * NOWHERE in this system: no table, no flag, no gate. Rendering them with ticks
 * would be a comparison table promising things nobody can deliver, which is a
 * worse failure on a pricing page than anywhere else in the app.
 *
 * Rows are grouped by the menu's own `menu_group` (Core / Additional / Custom),
 * which is the only grouping the data carries — the mockup's section headings
 * (Event & Guest Management, Templates & Branding, …) are editorial and have no
 * column behind them.
 */
export default function AllFeaturesPage() {
    const { data, isLoading } = useBillingPlans();
    const plans = useMemo(() => data?.plans ?? [], [data]);

    // Grouped by the data's own grouping, preserving first-seen order so the
    // table reads the same way every load.
    const grouped = useMemo(() => {
        const seen = new Map<number, { id: number; label: string; group: string }>();
        for (const p of plans) for (const f of p.features) if (!seen.has(f.id)) seen.set(f.id, f);

        const groups = new Map<string, { id: number; label: string; group: string }[]>();
        for (const f of seen.values()) {
            const key = f.group || 'core';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(f);
        }
        return Array.from(groups.entries());
    }, [plans]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5 p-4 md:p-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[500px] rounded-xl" />
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-5 p-4 md:p-6">
            <div className="flex flex-col gap-1">
                <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit text-muted-foreground">
                    <Link href="/dashboard/billing/upgrade"><ArrowLeft className="size-3.5" /> Back</Link>
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">All Features</h1>
                <p className="text-sm text-muted-foreground">
                    Compare every plan and see exactly what each one includes.
                </p>
            </div>

            {plans.length === 0 ? (
                <Card className="py-0">
                    <CardContent className="p-10 text-center">
                        <p className="text-sm font-medium">No plans available</p>
                        <p className="mt-1 text-[12.5px] text-muted-foreground">
                            There are no active plans to compare.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="py-0">
                    <CardContent className="flex flex-col gap-4 p-5">
                        {/* Scrolls inside its own box — the page must never scroll sideways. */}
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[220px]">Feature</TableHead>
                                        {plans.map((p) => (
                                            <TableHead key={p.id} className="min-w-[130px] text-center">
                                                <span className="flex flex-col items-center gap-1">
                                                    <span className="break-words">{p.name}</span>
                                                    <span className="text-[11px] font-normal text-muted-foreground">
                                                        {formatMoney(p.amount.subtotal, p.currency_code)}
                                                        {CYCLE_SUFFIX[p.billing_cycle]}
                                                    </span>
                                                    {p.is_current ? (
                                                        <Badge variant="ghost" className="bg-primary/15 text-[10px] text-primary">
                                                            Current
                                                        </Badge>
                                                    ) : null}
                                                </span>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {grouped.map(([group, features]) => (
                                        <>
                                            <TableRow key={`h-${group}`} className="bg-muted/40 hover:bg-muted/40">
                                                <TableCell
                                                    colSpan={plans.length + 1}
                                                    className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground"
                                                >
                                                    {group} modules
                                                </TableCell>
                                            </TableRow>
                                            {features.map((f) => (
                                                <TableRow key={f.id}>
                                                    <TableCell className="max-w-[280px] text-[12.5px] break-words">
                                                        {f.label}
                                                    </TableCell>
                                                    {plans.map((p) => (
                                                        <TableCell key={p.id} className="text-center">
                                                            {p.features.some((x) => x.id === f.id)
                                                                ? <CheckCircle2 className="mx-auto size-4 text-emerald-500" />
                                                                : <Minus className="mx-auto size-4 text-muted-foreground/40" />}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/*
                          Said out loud rather than left for somebody to notice. The
                          supplied design lists features this system has no concept of.
                        */}
                        <p className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-[11px] break-words text-muted-foreground">
                            <Info className="mt-0.5 size-3.5 shrink-0" />
                            Each row is a module the plan grants. Features not listed here — such as
                            team roles, API access or SSO — are not part of any plan yet.
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/billing/upgrade"><ArrowLeft className="size-3.5" /> Back to plans</Link>
                </Button>
                <Button asChild size="sm">
                    <Link href="/dashboard/billing/contact-sales">Need something custom?</Link>
                </Button>
            </div>
        </div>
    );
}
