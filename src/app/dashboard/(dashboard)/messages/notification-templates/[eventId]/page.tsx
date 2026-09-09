import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EventNotificationTemplatesContent } from './_components/event-notification-templates-content';

/**
 * One event's notification templates. In Next 16 `params` is a Promise and
 * must be awaited.
 */
export default async function EventNotificationTemplatesPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId: eventIdParam } = await params;
    const eventId = Number(eventIdParam);

    // Guard here, before the client component mounts: Number("abc") is NaN and
    // would fire GET /client/events/NaN/notification-templates.
    if (!Number.isInteger(eventId) || eventId <= 0) {
        return (
            <Card className="border border-border py-0 shadow-none">
                <CardContent className="flex flex-col items-center gap-2 py-20 text-center">
                    <p className="text-[15px] font-semibold text-foreground">Event not found</p>
                    <p className="text-[13px] text-muted-foreground">That is not a valid event link.</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 h-9 text-[12.5px]">
                        <Link href="/dashboard/messages/notification-templates">Back to Events</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return <EventNotificationTemplatesContent eventId={eventId} />;
}
