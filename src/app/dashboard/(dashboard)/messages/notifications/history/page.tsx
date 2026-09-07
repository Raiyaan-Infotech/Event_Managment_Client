'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, History, RotateCcw } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCampaigns, useComposer } from '@/hooks/use-messages';
import { PushStatsRow, NotificationRow } from '../_components/push-stats';

/**
 * Messages → Notification History.
 *
 * ── ⚠ THE CARDS AND THE TABLE ANSWER DIFFERENT QUESTIONS ────────────────────
 * The five cards are ALL-TIME, whole account. The table is the filtered page.
 * They are deliberately not wired together: a filtered total that changes as
 * you narrow a date range cannot be compared to anything, and somebody
 * checking "how are we doing overall" needs a number that holds still. The
 * cards say "All time" on their face for the same reason.
 *
 * ── FILTERS ARE THE SERVER'S ────────────────────────────────────────────────
 * Every filter is a query parameter, not a client-side `.filter()`. The list is
 * paginated, so filtering in the browser would search one page and quietly
 * report that nothing matched.
 */

const ALL = '__all__';

export default function NotificationHistoryPage() {
    const [status, setStatus] = useState<string>(ALL);
    const [eventId, setEventId] = useState<string>(ALL);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [page, setPage] = useState(1);

    const composer = useComposer(null);
    const events = composer.data?.events ?? [];

    const { data, isLoading } = useCampaigns({
        channel: 'push',
        status: status === ALL ? undefined : status,
        event_id: eventId === ALL ? undefined : Number(eventId),
        from: from || undefined,
        to: to || undefined,
        page,
        limit: 10,
    });

    const rows = data?.campaigns ?? [];
    const pagination = data?.pagination;

    const reset = () => {
        setStatus(ALL);
        setEventId(ALL);
        setFrom('');
        setTo('');
        setPage(1);
    };

    const dirty = status !== ALL || eventId !== ALL || Boolean(from) || Boolean(to);

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">Notification History</h1>
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <Flame className="size-3" /> Firebase
                        </span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                        Every push notification sent from this account, and how it performed.
                    </p>
                </div>

                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/messages/notifications">
                        <ArrowLeft className="size-4" /> Back to Send
                    </Link>
                </Button>
            </div>

            {/* ── Filters ─────────────────────────────────────────────────── */}
            <Card>
                <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[12px]">From</Label>
                        <Input
                            type="date"
                            value={from}
                            className="h-8 text-[12.5px]"
                            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[12px]">To</Label>
                        <Input
                            type="date"
                            value={to}
                            className="h-8 text-[12.5px]"
                            onChange={(e) => { setTo(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[12px]">Status</Label>
                        <Select
                            value={status}
                            onValueChange={(v) => { setStatus(v); setPage(1); }}
                        >
                            <SelectTrigger className="h-8 w-full text-[12.5px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All statuses</SelectItem>
                                <SelectItem value="sent">Delivered</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="sending">Recorded</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[12px]">Event</Label>
                        <Select
                            value={eventId}
                            onValueChange={(v) => { setEventId(v); setPage(1); }}
                        >
                            <SelectTrigger className="h-8 w-full text-[12.5px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All events</SelectItem>
                                {events.map((e) => (
                                    <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-full text-[12.5px]"
                            disabled={!dirty}
                            onClick={reset}
                        >
                            <RotateCcw className="size-3.5" /> Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* All-time, whole account — see the header for why these do not
                follow the filters above. */}
            <PushStatsRow />

            {/* ── Table ───────────────────────────────────────────────────── */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col gap-2 p-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 rounded-lg" />
                            ))}
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                            <History className="size-6 text-muted-foreground" />
                            <p className="text-[13px] font-medium">
                                {dirty ? 'Nothing matches those filters' : 'No notifications yet'}
                            </p>
                            <p className="max-w-sm text-[12px] text-muted-foreground">
                                {dirty
                                    ? 'Try widening the date range or clearing the status.'
                                    : 'Push notifications you send will be recorded here, with delivery and open rates.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[12.5px]">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-[11.5px] text-muted-foreground">
                                        <th className="px-4 py-2 font-medium">Notification</th>
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

                    {pagination && pagination.totalPages > 1 ? (
                        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-4 py-3">
                            <span className="text-[12px] text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                                {' · '}
                                {pagination.totalItems} notification
                                {pagination.totalItems === 1 ? '' : 's'}
                            </span>
                            <div className="flex gap-1.5">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[12px]"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[12px]"
                                    disabled={page >= pagination.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
