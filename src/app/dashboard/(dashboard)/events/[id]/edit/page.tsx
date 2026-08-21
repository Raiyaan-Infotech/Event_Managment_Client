import { EventWizard } from "../../_components/event-wizard";

/**
 * Edit an event — the destination of "Continue Editing" on a draft, and of
 * Edit on the detail page.
 *
 * Same wizard as the create route, prefilled from the row and PUTting instead
 * of POSTing. In Next 16 `params` is a Promise and must be awaited.
 */
export default async function EditEventPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    // A non-numeric id would become NaN and fire GET /client/events/NaN.
    const eventId = Number(id);
    if (!Number.isInteger(eventId) || eventId <= 0) return <EventWizard />;
    return <EventWizard eventId={eventId} />;
}
