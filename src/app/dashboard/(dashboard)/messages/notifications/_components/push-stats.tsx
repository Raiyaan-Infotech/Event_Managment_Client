'use client';

import Link from 'next/link';
import {
    Send, CheckCircle2, Eye, MousePointerClick, XCircle, Bell,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaigns, timeAgo, type Campaign } from '@/hooks/use-messages';

/**
 * The five cards and the recent list, shared by the Push and History screens.
 *
 * ── ⚠ EVERY NUMBER HERE IS OURS, NOT FIREBASE'S ─────────────────────────────
 * Sent, Delivered, Opened, Clicked and Failed are all read from
 * `event_messages` — one row per recipient, written by this system. Firebase
 * reports none of these back to a server; its API answers only "accepted" or
 * "rejected" for one token at a time.
 *
 * So the meanings are, precisely:
 *   Sent       recipient rows written
 *   Delivered  Firebase ACCEPTED the message for that guest's device
 *   Opened     the app told us the guest opened it
 *   Clicked    the app told us the guest tapped through
 *   Failed     every one of that guest's devices refused it, with a reason
 *
 * This is what was asked for — the record comes from our own database — and it
 * is also the only version that can be believed, because a percentage sourced
 * from a service that does not report it would be invented.
 */

const CARDS = [
    { key: 'total', label: 'Sent', hint: 'All time', icon: Send, tint: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2, tint: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
    { key: 'opened', label: 'Opened', icon: Eye, tint: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
    { key: 'clicked', label: 'Clicked', icon: MousePointerClick, tint: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
    { key: 'failed', label: 'Failed', icon: XCircle, tint: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
] as const;

export function PushStatsRow() {
    const { data, isLoading } = useCampaigns({ channel: 'push', limit: 1 });

    if (isLoading) {
        return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {CARDS.map((c) => <Skeleton key={c.key} className="h-[86px] rounded-xl" />)}
            </div>
        );
    }

    const push = data?.stats.by_channel?.push;
    const total = push?.total ?? 0;

    /*
      Percentages are computed against SENT, and only when something was sent.
      A "0.0%" under a zero is noise; the card simply omits the line, which is
      also what stops a fresh account reading as though something failed.
    */
    const pct = (n: number) => (total ? `${Math.round((n / total) * 1000) / 10}%` : null);

    const values: Record<string, { value: number; sub: string | null }> = {
        total: { value: total, sub: 'All time' },
        delivered: { value: push?.delivered ?? 0, sub: pct(push?.delivered ?? 0) },
        opened: { value: push?.opened ?? 0, sub: pct(push?.opened ?? 0) },
        clicked: { value: push?.clicked ?? 0, sub: pct(push?.clicked ?? 0) },
        failed: { value: push?.failed ?? 0, sub: pct(push?.failed ?? 0) },
    };

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CARDS.map(({ key, label, icon: Icon, tint }) => {
                const v = values[key];
                return (
                    <Card key={key}>
                        <CardContent className="flex items-center gap-3 p-4">
                            <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                                <Icon className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-xl font-semibold tabular-nums leading-none">{v.value}</p>
                                <p className="mt-1 text-[12px] font-medium">{label}</p>
                                {v.sub ? (
                                    <p className="text-[11px] text-muted-foreground">{v.sub}</p>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

/* ── Recent list ──────────────────────────────────────────────────────────── */

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    scheduled: { label: 'Scheduled', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
    /* Not "Sending": nothing is in flight. A push that reads `sending` was
       recorded while Firebase was unconfigured, exactly as the other channels
       are recorded with no provider behind them. */
    sending: { label: 'Recorded', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    sent: { label: 'Delivered', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
    failed: { label: 'Failed', className: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
};

export function StatusBadge({ status }: { status: string }) {
    const s = STATUS_STYLE[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
    return <Badge className={`${s.className} border-0 text-[11px] font-medium`}>{s.label}</Badge>;
}

export function RecentNotifications({
    limit = 5, title, emptyHint, icon: Icon = Bell,
}: {
    limit?: number;
    title: string;
    emptyHint: string;
    icon?: React.ElementType;
}) {
    const { data, isLoading } = useCampaigns({ channel: 'push', limit });
    const rows = data?.campaigns ?? [];

    return (
        <Card>
            <CardContent className="p-0">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
                    <p className="text-[13px] font-semibold">{title}</p>
                    {rows.length ? (
                        <Link
                            href="/dashboard/messages/notifications/history"
                            className="text-[12px] text-muted-foreground hover:text-foreground"
                        >
                            View all
                        </Link>
                    ) : null}
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-2 p-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                        <Icon className="size-6 text-muted-foreground" />
                        <p className="text-[12.5px] text-muted-foreground">{emptyHint}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-[12.5px]">
                            <thead>
                                <tr className="border-b border-border/60 text-left text-[11.5px] text-muted-foreground">
                                    <th className="px-4 py-2 font-medium">Title</th>
                                    <th className="px-3 py-2 font-medium">Target</th>
                                    <th className="px-3 py-2 font-medium">Sent</th>
                                    <th className="px-3 py-2 font-medium">Delivered</th>
                                    <th className="px-3 py-2 font-medium">Opened</th>
                                    <th className="px-3 py-2 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((c) => <NotificationRow key={c.id} campaign={c} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const AUDIENCE_LABEL: Record<string, string> = {
    all: 'All Guests',
    groups: 'By Group',
    guests: 'Specific Guests',
};

export function NotificationRow({ campaign: c }: { campaign: Campaign }) {
    const d = c.delivery;
    /* Rates against what was actually SENT for this campaign, not the account
       total — a per-row percentage of a global denominator is meaningless. */
    const share = (n: number | undefined) =>
        (d && d.total ? ` (${Math.round(((n ?? 0) / d.total) * 1000) / 10}%)` : '');

    return (
        <tr className="border-b border-border/40 last:border-0 hover:bg-muted/40">
            <td className="max-w-[240px] px-4 py-2.5">
                <Link
                    href={`/dashboard/messages/${c.id}`}
                    className="block break-all font-medium line-clamp-1 hover:underline"
                >
                    {c.subject}
                </Link>
                {c.event ? (
                    <span className="block break-all text-[11.5px] text-muted-foreground line-clamp-1">
                        {c.event.name}
                    </span>
                ) : null}
            </td>
            <td className="px-3 py-2.5">
                <Badge variant="outline" className="text-[11px] font-normal">
                    {AUDIENCE_LABEL[c.audience] ?? c.audience}
                </Badge>
            </td>
            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                {c.sent_at ? timeAgo(c.sent_at) : c.scheduled_at ? timeAgo(c.scheduled_at) : '—'}
            </td>
            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                {d?.delivered ?? 0}
                <span className="text-muted-foreground">{share(d?.delivered)}</span>
            </td>
            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                {d?.opened ?? 0}
                <span className="text-muted-foreground">{share(d?.opened)}</span>
            </td>
            <td className="px-3 py-2.5">
                <StatusBadge status={c.status} />
            </td>
        </tr>
    );
}
