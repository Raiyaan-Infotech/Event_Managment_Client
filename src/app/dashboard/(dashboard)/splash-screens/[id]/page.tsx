import Link from 'next/link';
import { SplashForm } from '../_components/splash-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/** Edit Splash Screen. In Next 16 `params` is a Promise and must be awaited. */
export default async function EditSplashScreenPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const splashId = Number(id);

    if (!Number.isInteger(splashId) || splashId <= 0) {
        return (
            <Card className="border border-border py-0 shadow-none">
                <CardContent className="flex flex-col items-center gap-2 py-20 text-center">
                    <p className="text-[15px] font-semibold text-foreground">Splash screen not found</p>
                    <p className="text-[13px] text-muted-foreground">That is not a valid link.</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 h-9 text-[12.5px]">
                        <Link href="/dashboard/splash-screens">Back to Splash Screens</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return <SplashForm splashId={splashId} />;
}
