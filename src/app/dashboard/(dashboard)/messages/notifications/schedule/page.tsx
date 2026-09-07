'use client';

import Link from 'next/link';
import {
    CalendarClock, Flame, Send, CalendarDays, Clock, CalendarRange,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaigns, timeAgo, type Campaign } from '@/hooks/use-messages';
import { PushComposer } from '../_components/push-composer';

/**
 * Messages → Schedule for Later.
 *
 * The same composer as the Send page, opened on "Schedule for Later", plus the
 * queue of what is already waiting.
 *
 * ── ⚠ WHAT MAKES A SCHEDULED NOTIFICATION ACTUALLY FIRE ────────────────────
 * `campaignScheduler.service` on the backend, which ticks every minute and is
 * started from `server.js`. That last part is the whole point: the project
 * already contained a scheduler nothing ever called, which is how "Schedule
 * for Later" becomes a button that saves a row and then silently does nothing
 * forever. If scheduled notifications stop firing, check that the server
 * process is running before looking anywhere else.
 */

/** A due time in the past that is still 'scheduled' means the tick has not run. */
const isOverdue = (c: Campaign) =>
    c.status === 'scheduled' && Boolean(c.scheduled_at) && new Date(c.scheduled_at!) < new Date();

export default function SchedulePushPage() {
    const { data, isLoading } = useCampaigns({ channel: 'push', status: 'scheduled', limit: 25 });
    const queued = data?.campaigns ?? [];

    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const endOfWeek = new Date(endOfDay);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfDay.getDay()));
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const within = (until: Date) => queued.filter(
        (c) => c.scheduled_at && new Date(c.scheduled_at) <= until,
    ).length;

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">Schedule Push Notification</h1>
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <Flame className="size-3" /> Firebase
                        </span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                        Write it now, deliver it at the right moment.
                    </p>
                </div>

                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/messages/notifications">
                        <Send className="size-4" /> Send Now Instead
                    </Link>
                </Button>
            </div>

            {/* Counts of what is WAITING — deliberately not all-time totals, which
                would say nothing about the queue this page is about. */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <QueueCard
                    icon={CalendarClock}
                    tint="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
                    value={queued.length}
                    label="Scheduled"
                    hint="Waiting to send"
                    loading={isLoading}
                />
                <QueueCard
                    icon={CalendarDays}
                    tint="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                    value={within(endOfDay)}
                    label="Today"
                    hint={now.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    loading={isLoading}
                />
                <QueueCard
                    icon={Clock}
                    tint="text-amber-600 dark:text-amber-400 bg-amber-500/10"
                    value={within(endOfWeek)}
                    label="This week"
                    hint="Through Saturday"
                    loading={isLoading}
                />
                <QueueCard
                    icon={CalendarRange}
                    tint="text-sky-600 dark:text-sky-400 bg-sky-500/10"
                    value={within(endOfMonth)}
                    label="This month"
                    hint={now.toLocaleDateString(undefined, { month: 'long' })}
                    loading={isLoading}
                />
            </div>

            <PushComposer defaultSchedule="later" />

            {/* ── Upcoming ────────────────────────────────────────────────── */}
            <Card>
                <CardContent className="p-0">
                    <div className="border-b border-border/60 px-4 py-3">
                        <p className="text-[13px] font-semibold">Upcoming Scheduled Notifications</p>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col gap-2 p-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 rounded-lg" />
                            ))}
                        </div>
                    ) : queued.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                            <CalendarClock className="size-6 text-muted-foreground" />
                            <p className="text-[12.5px] text-muted-foreground">
                                Nothing scheduled. Anything you schedule above will queue here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[12.5px]">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-[11.5px] text-muted-foreground">
                                        <th className="px-4 py-2 font-medium">Title</th>
                                        <th className="px-3 py-2 font-medium">Recipients</th>
                                        <th className="px-3 py-2 font-medium">Schedule Time</th>
                                        <th className="px-3 py-2 font-medium">Created</th>
                                        <th className="px-3 py-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queued.map((c) => (
                                        <tr
                                            key={c.id}
                                            className="border-b border-border/40 last:border-0 hover:bg-muted/40"
                                        >
                                            <td className="max-w-[260px] px-4 py-2.5">
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
                                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                                                {c.recipients_count}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5">
                                                {c.scheduled_at
                                                    ? new Date(c.scheduled_at).toLocaleString(undefined, {
                                                        day: 'numeric', month: 'short',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })
                                                    : '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                                                {timeAgo(c.created_at)}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {isOverdue(c) ? (
                                                    /*
                                                      Said plainly rather than left looking normal.
                                                      A due-but-unsent row means the scheduler is not
                                                      ticking, and the only way anyone finds that out
                                                      is if the screen says so.
                                                    */
                                                    <Badge className="border-0 bg-amber-500/15 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                                        Due — not sent yet
                                                    </Badge>
                                                ) : (
                                                    <Badge className="border-0 bg-blue-500/15 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                                                        Scheduled
                                                    </Badge>
                                                )}
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

function QueueCard({
    icon: Icon, tint, value, label, hint, loading,
}: {
    icon: React.ElementType;
    tint: string;
    value: number;
    label: string;
    hint: string;
    loading: boolean;
}) {
    if (loading) return <Skeleton className="h-[86px] rounded-xl" />;
    return (
        <Card>
            <CardContent className="flex items-center gap-3 p-4">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                    <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-xl font-semibold tabular-nums leading-none">{value}</p>
                    <p className="mt-1 text-[12px] font-medium">{label}</p>
                    <p className="break-words text-[11px] text-muted-foreground">{hint}</p>
                </div>
            </CardContent>
        </Card>
    );
}
