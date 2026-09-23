"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEventOptions } from "@/hooks/use-client-portal";
import { useClientEvents } from "@/hooks/use-client-events";
import { EventWizard } from "./event-wizard";

/**
 * Stops the create wizard opening at all once the plan's event limit is reached.
 *
 * The backend refuses the create either way (clientEvent.createEvent), but that
 * answer only arrives after five steps of typing — the limit is knowable before
 * the first field, so it is said before the first field.
 *
 * Both numbers come from calls the wizard makes anyway: the limit rides on the
 * plan in `/client/event-options`, and the count is the events list's own total.
 * Deliberately NOT the billing endpoint — a screen that refuses to open must not
 * depend on a second service answering.
 *
 * Fail-open: while either number is loading or absent (an older backend does not
 * send the limits) the wizard opens. A reporting gap should not stop somebody
 * creating an event they are entitled to — the backend still has the last word.
 */
export function EventLimitGate({ initialThemeId }: { initialThemeId?: string }) {
    const options = useEventOptions();
    // limit: 1 — this asks for the TOTAL in the pagination envelope, not the rows.
    const events = useClientEvents({ limit: 1 });

    const limit = options.data?.plan?.max_events ?? null;
    const used = events.data?.pagination?.totalItems ?? null;
    const limitReached =
        !options.isLoading && !events.isLoading && limit !== null && used !== null && used >= limit;

    if (!limitReached) return <EventWizard initialThemeId={initialThemeId} />;

    return (
        <Card className="mx-auto mt-6 max-w-lg">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                <FontAwesomeIcon icon={faCalendarXmark} className="!size-[26px] text-muted-foreground/40" />
                <p className="text-[14px] font-semibold text-foreground">Event limit reached</p>
                <p className="max-w-sm text-[13px] text-muted-foreground">
                    Your {options.data?.plan?.name ?? "current"} plan allows {limit} event{limit === 1 ? "" : "s"} and
                    you have created {used}. Upgrade your plan to create more.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <Button asChild size="sm" className="h-8 text-[12px]">
                        <Link href="/dashboard/billing">View Plan &amp; Billing</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
                        <Link href="/dashboard/events">Back to Events</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
