'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Bell, BellOff, CheckCheck, Search, Calendar, MessageSquare, Send,
    UserPlus, CheckSquare, Settings, Archive, X, ChevronLeft, ChevronRight,
    Loader2, Inbox, Users,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
    useNotifications, useMarkAllRead, useMarkNotificationRead, useArchiveNotification,
    timeAgo, type AppNotification, type NotificationCategory,
} from '@/hooks/use-messages';
import { useDateFormatter } from '@/hooks/use-client-settings';

/**
 * Notifications.
 *
 * ── EVERY ROW HERE IS SOMETHING THAT REALLY HAPPENED ────────────────────────
 * The feed is written only by other services — a campaign was recorded, a guest
 * replied, a guest was added. There is no route that creates a notification, so
 * nothing on this screen can be seeded or demonstrated: an empty feed means
 * nothing has happened yet, and says so.
 *
 * ── ⚠ "MARK ALL AS READ" IS SCOPED TO THE TAB IN VIEW ───────────────────────
 * Pressed on the RSVP tab it clears RSVP and nothing else. Clearing the System
 * tab somebody has not looked at is silent loss of the only thing this screen
 * manages, which is attention. The server enforces the scope; this passes it
 * the tab.
 *
 * ── ARCHIVE IS A SOFT HIDE ──────────────────────────────────────────────────
 * "Dealt with" and "never happened" are different answers, and only one of them
 * should survive a support question. Archiving also marks read, because a row
 * you have dealt with is not still waiting for you.
 */

const TABS: { value: NotificationCategory | 'all' | 'unread'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'rsvp', label: 'RSVP' },
    { value: 'reminder', label: 'Reminders' },
    { value: 'message', label: 'Messages' },
    { value: 'system', label: 'System' },
];

const CATEGORY_META: Record<NotificationCategory, { label: string; icon: React.ElementType; tint: string }> = {
    rsvp: { label: 'RSVP', icon: CheckSquare, tint: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
    reminder: { label: 'Reminder', icon: Calendar, tint: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
    message: { label: 'Message', icon: MessageSquare, tint: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
    system: { label: 'System', icon: Send, tint: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    guest: { label: 'Guest', icon: UserPlus, tint: 'bg-pink-500/15 text-pink-600 dark:text-pink-400' },
};

export default function NotificationsPage() {
    const [tab, setTab] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<AppNotification | null>(null);
    const fmt = useDateFormatter();

    const [debounced, setDebounced] = useState('');
    useEffect(() => {
        const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    // 'unread' is a FILTER across all five categories, not a sixth category —
    // which is why it is unpacked into two different arguments here.
    const category = tab === 'all' || tab === 'unread' ? undefined : (tab as NotificationCategory);
    const unread = tab === 'unread';

    const { data, isLoading, isFetching } = useNotifications({
        category, unread, search: debounced, page, limit: 10,
    });

    const markAll = useMarkAllRead();
    const markOne = useMarkNotificationRead();
    const archive = useArchiveNotification();

    const rows = data?.notifications ?? [];
    const stats = data?.stats;
    const pagination = data?.pagination;

    // Keeps the panel in step with the list after a read/archive round trip.
    useEffect(() => {
        if (!selected) return;
        const fresh = rows.find((n) => n.id === selected.id);
        if (fresh) setSelected(fresh);
        else setSelected(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    function open(n: AppNotification) {
        setSelected(n);
        // Opening it IS reading it. A separate "mark read" click for something
        // you are looking at is a step nobody would take.
        if (!n.is_read) markOne.mutate({ id: n.id });
    }

    if (isLoading && !data) {
        return (
            <div className="flex flex-col gap-5 p-4 md:p-6">
                <Skeleton className="h-9 w-48" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <Skeleton className="h-96 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-5 p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
                    <p className="text-sm break-words text-muted-foreground">
                        Stay updated with event activity and guest engagement.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        disabled={markAll.isPending || !stats?.unread}
                        onClick={() => markAll.mutate({ category })}
                    >
                        {markAll.isPending
                            ? <Loader2 className="size-3.5 animate-spin" />
                            : <CheckCheck className="size-3.5" />}
                        {/* Names the scope, so nobody presses it expecting more. */}
                        {category ? `Mark ${CATEGORY_META[category].label} as read` : 'Mark all as read'}
                    </Button>
                    <Button asChild size="sm" variant="outline">
                        <Link href="/dashboard/settings?tab=notifications">
                            <Settings className="size-3.5" /> Notification Settings
                        </Link>
                    </Button>
                </div>
            </div>

            {/* ── Tiles: the whole feed, never the filtered page ────────────── */}
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Tile icon={Bell} tint="bg-violet-500/15 text-violet-600 dark:text-violet-400"
                    value={stats?.total ?? 0} label="Total Notifications" hint="All time" />
                <Tile icon={Inbox} tint="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    value={stats?.unread ?? 0} label="Unread" hint="Needs your attention" />
                <Tile icon={Calendar} tint="bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    value={stats?.reminders ?? 0} label="Event Reminders" hint="Upcoming events" />
                <Tile icon={Users} tint="bg-pink-500/15 text-pink-600 dark:text-pink-400"
                    value={stats?.guest_activity ?? 0} label="Guest Activity" hint="RSVPs and new guests" />
            </div>

            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
                <Card className="py-0">
                    <CardContent className="flex min-w-0 flex-col gap-4 p-5">
                        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                            <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); }}>
                                <TabsList variant="line" className="overflow-x-auto">
                                    {TABS.map((t) => {
                                        const count = t.value === 'all'
                                            ? stats?.total
                                            : t.value === 'unread'
                                                ? stats?.unread
                                                : stats?.by_category?.[t.value as NotificationCategory]?.total;
                                        return (
                                            <TabsTrigger key={t.value} value={t.value}>
                                                {t.label}
                                                {count ? (
                                                    <span className="ms-1.5 text-[10.5px] opacity-60">{count}</span>
                                                ) : null}
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>
                            </Tabs>

                            <div className="relative min-w-[180px] flex-1">
                                <Search className="absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search notifications…"
                                    className="h-9 ps-8 text-[12.5px]"
                                />
                            </div>
                        </div>

                        {rows.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center">
                                <BellOff className="size-5 text-muted-foreground/60" />
                                <p className="text-[13px] font-semibold">
                                    {debounced || tab !== 'all' ? 'Nothing here' : 'No notifications yet'}
                                </p>
                                <p className="max-w-sm text-[12px] break-words text-muted-foreground">
                                    {debounced || tab !== 'all'
                                        ? 'Nothing matches this filter.'
                                        : 'RSVPs, new guests and messages you send will show up here.'}
                                </p>
                            </div>
                        ) : (
                            <div className={`flex min-w-0 flex-col ${isFetching ? 'opacity-60 transition-opacity' : ''}`}>
                                {rows.map((n, i) => (
                                    <div key={n.id}>
                                        <NotificationRow
                                            n={n}
                                            active={selected?.id === n.id}
                                            onOpen={() => open(n)}
                                        />
                                        {i < rows.length - 1 ? <Separator /> : null}
                                    </div>
                                ))}
                            </div>
                        )}

                        {rows.length > 0 && pagination && pagination.totalPages > 1 ? (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-[11.5px] text-muted-foreground">
                                    Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} notifications
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" className="size-8"
                                        disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        aria-label="Previous page">
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="size-8"
                                        disabled={page >= pagination.totalPages}
                                        onClick={() => setPage((p) => p + 1)} aria-label="Next page">
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                {/* ── Detail panel ─────────────────────────────────────────── */}
                <div className="min-w-0">
                    {selected ? (
                        <DetailPanel
                            n={selected}
                            fmt={fmt}
                            onClose={() => setSelected(null)}
                            onArchive={() => archive.mutate(selected.id)}
                            onToggleRead={() => markOne.mutate({ id: selected.id, read: !selected.is_read })}
                            busy={archive.isPending || markOne.isPending}
                        />
                    ) : (
                        <Card className="py-0">
                            <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
                                <Bell className="size-5 text-muted-foreground/60" />
                                <p className="text-[12.5px] font-medium">Nothing selected</p>
                                <p className="text-[11.5px] break-words text-muted-foreground">
                                    Choose a notification to see its detail.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function Tile({ icon: Icon, tint, value, label, hint }: {
    icon: React.ElementType; tint: string; value: number; label: string; hint: string;
}) {
    return (
        <Card className="py-0">
            <CardContent className="flex min-w-0 items-center gap-3 p-4">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tint}`}>
                    <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                    <p className="text-xl font-semibold tabular-nums">{value.toLocaleString('en-IN')}</p>
                    <p className="text-[12px] break-words">{label}</p>
                    <p className="text-[10.5px] text-muted-foreground">{hint}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function NotificationRow({ n, active, onOpen }: {
    n: AppNotification; active: boolean; onOpen: () => void;
}) {
    const meta = CATEGORY_META[n.category] ?? CATEGORY_META.system;
    return (
        <button
            type="button"
            onClick={onOpen}
            className={`flex w-full min-w-0 items-start gap-3 px-1 py-3.5 text-start transition-colors ${
                active ? 'bg-muted/60' : 'hover:bg-muted/40'
            }`}
        >
            {/* The unread dot, not a bold row: bold text on half a list is
                harder to scan than one consistent weight plus a marker. */}
            <span className={`mt-2 size-1.5 shrink-0 rounded-full ${n.is_read ? 'bg-transparent' : 'bg-primary'}`} />
            <span className={`grid size-9 shrink-0 place-items-center rounded-full ${meta.tint}`}>
                <meta.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium break-words">{n.title}</span>
                {n.body ? (
                    <span className="mt-0.5 block line-clamp-2 text-[11.5px] break-words text-muted-foreground">
                        {n.body}
                    </span>
                ) : null}
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[10.5px] whitespace-nowrap text-muted-foreground">
                    {timeAgo(n.created_at)}
                </span>
                <Badge variant="ghost" className={`${meta.tint} text-[10px]`}>{meta.label}</Badge>
            </span>
        </button>
    );
}

function DetailPanel({ n, fmt, onClose, onArchive, onToggleRead, busy }: {
    n: AppNotification;
    fmt: (v: string | null | undefined, withTime?: boolean) => string;
    onClose: () => void;
    onArchive: () => void;
    onToggleRead: () => void;
    busy: boolean;
}) {
    const meta = CATEGORY_META[n.category] ?? CATEGORY_META.system;
    return (
        <Card className="py-0">
            <CardContent className="flex min-w-0 flex-col gap-4 p-5">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold">Notification Details</span>
                    <Button size="icon" variant="ghost" className="size-7" onClick={onClose} aria-label="Close">
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="flex items-start justify-between gap-2">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-full ${meta.tint}`}>
                        <meta.icon className="size-4" />
                    </span>
                    <Badge variant="ghost" className={`${meta.tint} text-[10.5px]`}>{meta.label}</Badge>
                </div>

                <div className="min-w-0">
                    <p className="text-[14px] font-semibold break-words">{n.title}</p>
                    {/* Relative above, absolute underneath: "2 min ago" is what a
                        person wants, and the exact time is what they check. */}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {timeAgo(n.created_at)} · {fmt(n.created_at, true)}
                    </p>
                </div>

                {n.body ? (
                    <p className="text-[12.5px] break-words text-muted-foreground">{n.body}</p>
                ) : null}

                {n.guest ? (
                    <>
                        <Separator />
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-muted-foreground">Guest</p>
                            <p className="mt-1 text-[12.5px] font-medium break-words">{n.guest.name}</p>
                            {n.guest.email ? (
                                <p className="text-[11.5px] break-all text-muted-foreground">{n.guest.email}</p>
                            ) : null}
                            {n.guest.mobile ? (
                                <p className="text-[11.5px] text-muted-foreground">{n.guest.mobile}</p>
                            ) : null}
                        </div>
                    </>
                ) : null}

                {n.event ? (
                    <>
                        <Separator />
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-muted-foreground">Event</p>
                            <p className="mt-1 text-[12.5px] font-medium break-words">{n.event.name}</p>
                        </div>
                    </>
                ) : null}

                <Separator />

                <div className="flex flex-wrap gap-2">
                    {/*
                      The link is only offered when the row still has one. An
                      event since deleted leaves `link` intact but `event` null —
                      and a button that 404s is worse than no button.
                    */}
                    {n.link ? (
                        <Button asChild size="sm" className="flex-1">
                            <Link href={n.link}>Open</Link>
                        </Button>
                    ) : null}
                    <Button size="sm" variant="outline" disabled={busy} onClick={onToggleRead}>
                        {n.is_read ? 'Mark unread' : 'Mark read'}
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={onArchive}>
                        <Archive className="size-3.5" /> Archive
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
