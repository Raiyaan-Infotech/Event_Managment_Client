import RsvpEditScreen from './rsvp-edit';

/**
 * Edit an RSVP response.
 *
 * The id is validated HERE, before the client component mounts — otherwise
 * `Number("abc")` is `NaN` and the page fires `PUT /client/rsvps/NaN`.
 */
export default async function EditRsvpPage({ params }: { params: Promise<{ id: string }> }) {
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

    return <RsvpEditScreen rsvpId={numeric} />;
}
