import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GuestProfileScreen } from './guest-profile';

/**
 * Guest Profile.
 *
 * ⚠ A SIBLING of `/guests/[id]`, which is the guest EDIT FORM — name, email,
 * phone. This is the read-heavy profile: who this person is across every event.
 * The two take the same id and are deliberately different screens; see §364 for
 * why contact details are only writable on one of them.
 *
 * In Next 16 `params` is a Promise and must be awaited.
 */
export default async function GuestProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const guestId = Number(id);

    // Guarded here, before the client component mounts: `Number("abc")` is NaN
    // and the page would fire GET /client/guests/NaN/profile.
    if (!Number.isInteger(guestId) || guestId <= 0) {
        return (
            <Card className="border border-border py-0 shadow-none">
                <CardContent className="flex flex-col items-center gap-2 py-20 text-center">
                    <p className="text-[15px] font-semibold">Guest not found</p>
                    <p className="text-[13px] text-muted-foreground">That is not a valid guest link.</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 h-9 text-[12.5px]">
                        <Link href="/dashboard/rsvps">Back to RSVPs</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return <GuestProfileScreen guestId={guestId} />;
}
