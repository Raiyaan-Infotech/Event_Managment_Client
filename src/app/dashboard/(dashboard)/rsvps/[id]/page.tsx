import RsvpDetailScreen from './rsvp-detail';

/**
 * One RSVP.
 *
 * The id is validated HERE, in the server component, before the client one
 * mounts — otherwise `Number("abc")` is `NaN` and the page fires
 * `GET /client/rsvps/NaN`. Same guard the invoice, message and event detail
 * pages needed.
 *
 * ⚠ `/rsvps/groups/[id]` is a SIBLING of this route. Next resolves the static
 * `groups` segment before this dynamic one, so a group link never lands here —
 * but renaming either folder would break that, quietly.
 */
export default async function RsvpPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numeric = Number(id);

    if (!Number.isInteger(numeric) || numeric <= 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
                <p className="text-sm font-medium">RSVP not found</p>
                <p className="text-[12.5px] text-muted-foreground">
                    That is not a valid RSVP link.
                </p>
            </div>
        );
    }

    return <RsvpDetailScreen rsvpId={numeric} />;
}
