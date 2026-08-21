import Link from "next/link";
import { GuestForm } from "../_components/guest-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Edit Guest — same form as Add, prefilled and PUTting.
 * In Next 16 `params` is a Promise and must be awaited.
 */
export default async function EditGuestPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const guestId = Number(id);

    // Guard here, before the client component mounts: Number("abc") is NaN and
    // would fire GET /client/guests/NaN.
    if (!Number.isInteger(guestId) || guestId <= 0) {
        return (
            <Card className="border border-border py-0 shadow-none">
                <CardContent className="flex flex-col items-center gap-2 py-20 text-center">
                    <p className="text-[15px] font-semibold text-foreground">Guest not found</p>
                    <p className="text-[13px] text-muted-foreground">That is not a valid guest link.</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 h-9 text-[12.5px]">
                        <Link href="/dashboard/guests">Back to Guests</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return <GuestForm guestId={guestId} />;
}
