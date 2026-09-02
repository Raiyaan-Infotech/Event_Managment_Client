import { Suspense } from 'react';
import GroupDetailScreen from './group-detail';

/**
 * Group details.
 *
 * The id is validated HERE, before the client component mounts — otherwise
 * `Number("abc")` is `NaN` and the page fires `GET /client/rsvps/groups/NaN`.
 *
 * ⚠ This route is a SIBLING of `/rsvps/[id]`. Next resolves the static `groups`
 * segment ahead of the dynamic one, which is why a group link never lands on
 * the RSVP detail — renaming either folder would break that quietly.
 *
 * Suspense because the screen reads `?event_id=` with `useSearchParams`, which
 * opts the tree into client rendering.
 */
export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numeric = Number(id);

    if (!Number.isInteger(numeric) || numeric <= 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
                <p className="text-sm font-medium">Group not found</p>
                <p className="text-[12.5px] text-muted-foreground">
                    That is not a valid group link.
                </p>
            </div>
        );
    }

    return (
        <Suspense fallback={<div className="p-6" />}>
            <GroupDetailScreen groupId={numeric} />
        </Suspense>
    );
}
