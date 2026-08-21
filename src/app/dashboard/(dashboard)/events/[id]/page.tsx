import Link from "next/link";
import { EventDetail } from "./_components/event-detail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Event detail — the destination of every "View Details" button in this app.
 *
 * The route did not exist, so all of them fell through to the `[...slug]`
 * "coming soon" catch-all. In Next 16 `params` is a Promise and must be awaited.
 */
export default async function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const eventId = Number(id);

    // Guard here rather than in the client component: a non-numeric id would
    // otherwise become NaN and fire GET /client/events/NaN.
    if (!Number.isInteger(eventId) || eventId <= 0) {
        return (
            <Card className="border border-border shadow-none">
                <CardContent className="flex flex-col items-center gap-2 py-20 text-center">
                    <p className="text-[15px] font-semibold text-foreground">Event not found</p>
                    <p className="text-[13px] text-muted-foreground">That is not a valid event link.</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 h-9 text-[12.5px]">
                        <Link href="/dashboard/events">Back to My Events</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return <EventDetail eventId={eventId} />;
}
