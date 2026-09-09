'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Bell,
    CalendarDays,
    CheckCircle2,
    FileText,
    Search,
    TriangleAlert,
    XCircle,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';
import { SignInPrompt } from '@/components/common/sign-in-prompt';
import { useEventNotificationSummary, type EventNotificationSummaryRow } from '@/hooks/use-event-notification-templates';
import { useUpdateEvent, type EventStatus } from '@/hooks/use-client-events';

/**
 * Messages → Notification Templates. "Transactional Notifications by Event."
 *
 * Every one of the client's own events, with how many admin-authored
 * notification templates apply to it and how many of those the client has
 * turned off. Clicking an event opens the per-event toggle screen at
 * `[eventId]`.
 */

const STATUS_TRIGGER_TONE: Record<EventStatus, string> = {
    upcoming: 'text-warning',
    draft: 'text-muted-foreground',
    cancelled: 'text-foreground/70',
};

const STATUS_LABELS: Record<EventStatus, string> = {
    upcoming: 'Active',
    draft: 'Draft',
    cancelled: 'Cancelled',
};

const ALL = 'all';

export default function NotificationTemplatesByEventPage() {
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState(ALL);
    const [typeId, setTypeId] = useState(ALL);
    const [status, setStatus] = useState(ALL);

    const { data, isLoading, isError, error, refetch } = useEventNotificationSummary();
    const rows = useMemo(() => data?.events ?? [], [data]);
    const totals = data?.totals;

    // Reuses the same PUT /client/events/:id the event editor uses — a
    // partial update, so sending only `status` leaves every other field
    // untouched. Refetch the summary on success: it's a different query key
    // from useClientEvents', so its own cache invalidation doesn't reach here.
    const updateEvent = useUpdateEvent(() => refetch());

    const authError = error instanceof ApiError && error.isAuthError;

    const categories = useMemo(() => {
        const map = new Map<number, string>();
        rows.forEach((r) => { if (r.category) map.set(r.category.id, r.category.name); });
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [rows]);

    const types = useMemo(() => {
        const map = new Map<number, string>();
        rows.forEach((r) => { if (r.eventType) map.set(r.eventType.id, r.eventType.name); });
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [rows]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter((row) => {
            if (q && !row.name.toLowerCase().includes(q)) return false;
            if (categoryId !== ALL && String(row.category?.id) !== categoryId) return false;
            if (typeId !== ALL && String(row.eventType?.id) !== typeId) return false;
            if (status !== ALL && row.status !== status) return false;
            return true;
        });
    }, [rows, search, categoryId, typeId, status]);

    const tiles = [
        { label: 'Total Events', value: totals?.total_events ?? 0, icon: CalendarDays, tint: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Total Templates', value: totals?.total_templates ?? 0, icon: FileText, tint: 'text-info', bg: 'bg-info/10' },
        { label: 'Active Templates', value: totals?.active_templates ?? 0, icon: CheckCircle2, tint: 'text-success', bg: 'bg-success/10' },
        { label: 'Inactive Templates', value: totals?.inactive_templates ?? 0, icon: XCircle, tint: 'text-destructive', bg: 'bg-destructive/10' },
    ];

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold">Transactional Notifications by Event</h1>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                        View all events, template counts, and transactional notification status. Click an event to view its related templates.
                    </p>
                </div>
            </div>

            {authError && (
                <Card className="border-warning/40 bg-warning/10 shadow-none py-0">
                    <CardContent className="flex items-start gap-3 p-4">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                        <div>
                            <p className="text-[12.5px] font-semibold text-foreground">You are not signed in</p>
                            <p className="mt-0.5 text-[12px] text-muted-foreground">
                                Your session has ended. Sign in again to carry on.
                            </p>
                            <SignInPrompt className="mt-2.5" />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tiles.map((tile) => (
                    <Card key={tile.label} className="border border-border shadow-none py-0">
                        <CardContent className="flex items-center gap-3.5 p-4">
                            <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', tile.bg)}>
                                <tile.icon className={cn('size-4.5', tile.tint)} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[12.5px] font-medium text-muted-foreground">{tile.label}</p>
                                {isLoading ? (
                                    <Skeleton className="my-1 h-6 w-12" />
                                ) : (
                                    <p className="text-[22px] font-bold leading-tight tabular-nums text-foreground">
                                        {tile.value.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border border-border shadow-none py-0">
                <CardContent className="flex flex-col gap-3 p-4">
                    <div className="relative w-full">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search events by name, category, or type..."
                            className="h-10 w-full rounded-md pl-9 text-[13px]"
                        />
                    </div>

                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className="h-10 w-full rounded-md text-[13px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All Categories</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={typeId} onValueChange={setTypeId}>
                            <SelectTrigger className="h-10 w-full rounded-md text-[13px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All Types</SelectItem>
                                {types.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-10 w-full rounded-md text-[13px]">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All Statuses</SelectItem>
                                <SelectItem value="upcoming">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="min-w-0 gap-0 border border-border p-0 shadow-none">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="divide-y divide-border">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4">
                                    <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
                                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isError && !authError ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-center">
                            <TriangleAlert className="size-6 text-warning/60" />
                            <p className="text-[14px] font-semibold text-foreground">Could not load your events</p>
                            <p className="text-[13px] text-muted-foreground">
                                {error instanceof Error ? error.message : 'Unknown error.'}
                            </p>
                            <button
                                onClick={() => refetch()}
                                className="mt-2 text-[12.5px] font-semibold text-primary hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-center">
                            <Bell className="size-6 text-muted-foreground/40" />
                            <p className="text-[14px] font-semibold text-foreground">No events found</p>
                            <p className="text-[13px] text-muted-foreground">
                                {rows.length === 0
                                    ? 'Create an event to see its notification templates here.'
                                    : 'Try a different search or filter.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-[13px]">
                                <thead>
                                    <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        <th className="px-4 py-3">Event Name</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-center">Templates</th>
                                        <th className="px-4 py-3 text-center">Active</th>
                                        <th className="px-4 py-3 text-center">Inactive</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map((row: EventNotificationSummaryRow) => (
                                        <tr key={row.id}>
                                            <td className="px-4 py-3">
                                                <span className="break-words font-semibold text-foreground">{row.name}</span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{row.category?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{row.eventType?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-center tabular-nums">{row.templates_count}</td>
                                            <td className="px-4 py-3 text-center tabular-nums text-success">{row.active_count}</td>
                                            <td className="px-4 py-3 text-center tabular-nums text-destructive">{row.inactive_count}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Select
                                                    value={row.status}
                                                    disabled={updateEvent.isPending}
                                                    onValueChange={(value) => {
                                                        if (value === row.status) return;
                                                        updateEvent.mutate({ id: row.id, data: { status: value } });
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        className={cn(
                                                            'mx-auto h-8 w-[110px] rounded-md text-[11.5px] font-semibold',
                                                            STATUS_TRIGGER_TONE[row.status]
                                                        )}
                                                    >
                                                        <SelectValue>{STATUS_LABELS[row.status]}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="upcoming">Active</SelectItem>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/dashboard/messages/notification-templates/${row.id}`}
                                                    className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
                                                >
                                                    View Templates
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
