'use client';

import Link from 'next/link';
import { Bell, History, CalendarClock, Flame } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PushComposer } from './_components/push-composer';
import { PushStatsRow, RecentNotifications } from './_components/push-stats';

/**
 * Messages → Notifications. The push notification composer.
 *
 * ── WHY THIS IS NOT PART OF `messages/send` ─────────────────────────────────
 * Push looks like a fourth channel button next to WhatsApp and Email, and it
 * is one on the server. It is not one HERE, because its audience rule differs
 * from every other channel — a guest is reachable only if they installed the
 * app — and because it carries a screenful of delivery options none of the
 * others have. Folding it into that composer would have meant a form where
 * half the fields disappear depending on a radio button, and a recipient count
 * that means something different from one press to the next.
 */
export default function PushNotificationsPage() {
    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">Push Notifications</h1>
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <Flame className="size-3" /> Firebase
                        </span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                        Send push notifications to guests who have the Event Invit app installed.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/messages/notifications/history">
                            <History className="size-4" /> Notification History
                        </Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/dashboard/messages/notifications/schedule">
                            <CalendarClock className="size-4" /> Schedule for Later
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Whole-account totals, never the filtered page — same contract as
                the Messages screen's cards. */}
            <PushStatsRow />

            <PushComposer defaultSchedule="now" />

            <RecentNotifications
                limit={5}
                title="Recent Notifications"
                emptyHint="Notifications you send will be listed here."
                icon={Bell}
            />
        </div>
    );
}
