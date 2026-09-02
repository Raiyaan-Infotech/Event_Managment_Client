import MessageDetail from './message-detail';

/**
 * One message campaign.
 *
 * The id is validated HERE, in the server component, before the client one
 * mounts — otherwise `Number("abc")` is `NaN` and the page fires
 * `GET /client/messages/NaN`. Same guard the invoice and event detail pages
 * needed.
 */
export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numeric = Number(id);

    if (!Number.isInteger(numeric) || numeric <= 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
                <p className="text-sm font-medium">Message not found</p>
                <p className="text-[12.5px] text-muted-foreground">
                    That is not a valid message link.
                </p>
            </div>
        );
    }

    return <MessageDetail campaignId={numeric} />;
}
