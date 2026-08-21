import { EventWizard } from "../_components/event-wizard";

/**
 * Create New Event.
 *
 * The wizard itself lives in `_components/event-wizard.tsx` because
 * `/dashboard/events/[id]/edit` renders the very same six steps — "Continue
 * Editing" on a draft has to reopen this exact form, and keeping two copies is
 * how a field added to one goes missing from the other.
 *
 * `?theme=` is what the Templates screen's "Use Template" button passes. Read
 * here in the server component rather than with `useSearchParams` in the client
 * one, which would need its own Suspense boundary for a value known at request
 * time. In Next 16 `searchParams` is a Promise and must be awaited.
 */
export default async function CreateEventPage({
    searchParams,
}: {
    searchParams: Promise<{ theme?: string }>;
}) {
    const { theme } = await searchParams;
    return <EventWizard initialThemeId={theme} />;
}
