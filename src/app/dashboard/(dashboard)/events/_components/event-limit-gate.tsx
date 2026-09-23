"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarXmark } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBillingOverview } from "@/hooks/use-billing";
import { EventWizard } from "./event-wizard";

/**
 * Stops the create wizard opening at all once the plan's event limit is reached.
 *
 * The backend refuses the create either way (clientEvent.createEvent), but that
 * answer only arrives after five steps of typing — the limit is knowable before
 * the first field, so it is said before the first field.
 *
 * While the usage is loading or unknown (`available: false` means the backend
 * could not measure it, which is not the same as zero) the wizard opens: a
 * reporting gap should not stop somebody creating an event they are entitled to.
 */
export function EventLimitGate({ initialThemeId }: { initialThemeId?: string }) {
    const { data, isLoading } = useBillingOverview();

    const events = data?.usage.events;
    const limitReached =
        !isLoading &&
        events?.available === true &&
        events.limit !== null &&
        events.used !== null &&
        events.used >= events.limit;

    if (!limitReached) return <EventWizard initialThemeId={initialThemeId} />;

    return (
        <Card className="mx-auto mt-6 max-w-lg">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                <FontAwesomeIcon icon={faCalendarXmark} className="!size-[26px] text-muted-foreground/40" />
                <p className="text-[14px] font-semibold text-foreground">Event limit reached</p>
                <p className="max-w-sm text-[13px] text-muted-foreground">
                    Your plan allows {events!.limit} event{events!.limit === 1 ? "" : "s"} and you have
                    created {events!.used}. Upgrade your plan to create more.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <Button asChild size="sm" className="h-8 text-[12px]">
                        <Link href="/dashboard/billing">View Plan</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
                        <Link href="/dashboard/events">Back to Events</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
