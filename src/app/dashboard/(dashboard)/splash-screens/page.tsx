'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Sparkles, Plus, Search, Pencil, Trash2, MoreVertical, Image as ImageIcon,
    Video, Palette, Layers, Heart, Music, Eye,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
    useSplashScreens, useDeleteSplashScreen, type SplashScreen, type BackgroundType,
} from '@/hooks/use-splash-screens';
import { useDateFormatter } from '@/hooks/use-client-settings';
import { SplashPreviewFrame } from './_components/splash-preview';

/**
 * Splash Screens.
 *
 * ── ⚠ NOT TIED TO AN EVENT YET, DELIBERATELY ────────────────────────────────
 * Each row is a standalone saved config — "Event Name" is a field someone
 * typed, not a link to a real event on this account. Linking one to a real
 * event is a later phase. See the backend model header for the full reasoning.
 *
 * ── WHAT THIS ACTUALLY IS ────────────────────────────────────────────────────
 * The MOBILE APP's own splash/loading screen shown when a guest opens an
 * event — not a web page. Nothing here is shown to a guest today; this
 * screen only builds and saves the configuration.
 */

const PAGE_SIZE = 12;

export default function SplashScreensPage() {
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');
    const [page, setPage] = useState(1);
    const [pendingDelete, setPendingDelete] = useState<SplashScreen | null>(null);
    const [viewing, setViewing] = useState<SplashScreen | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    // Adjusted during render, not in a second effect — a new search term is
    // "derived state" React's own docs point at handling this way, and it
    // avoids the extra render pass a setState-in-effect would cost here.
    const [seenSearch, setSeenSearch] = useState(debounced);
    if (debounced !== seenSearch) {
        setSeenSearch(debounced);
        setPage(1);
    }

    const list = useSplashScreens({ search: debounced || undefined, page, limit: PAGE_SIZE });
    const remove = useDeleteSplashScreen();

    const rows = list.data?.data ?? [];
    const pagination = list.data?.pagination;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight">Splash Screens</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Design the splash screen guests see when they open an event in the app.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/splash-screens/create">
                        <Plus className="size-4" /> New Splash Screen
                    </Link>
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, title or event..."
                    className="pl-9"
                />
            </div>

            {list.isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
                </div>
            ) : rows.length === 0 ? (
                <Card className="py-0">
                    <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
                        <span className="grid size-14 place-items-center rounded-full bg-primary/10">
                            <Sparkles className="size-6 text-primary" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold">No splash screens yet</p>
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                Create your first splash screen to welcome guests into an event.
                            </p>
                        </div>
                        <Button asChild className="mt-2">
                            <Link href="/dashboard/splash-screens/create">
                                <Plus className="size-4" /> New Splash Screen
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rows.map((splash) => (
                        <SplashCard
                            key={splash.id}
                            splash={splash}
                            onView={() => setViewing(splash)}
                            onDelete={() => setPendingDelete(splash)}
                        />
                    ))}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline" size="sm" disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-[12.5px] text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline" size="sm" disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this splash screen?</DialogTitle>
                        <DialogDescription>
                            &quot;{pendingDelete?.name}&quot; will be permanently deleted. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={remove.isPending}
                            onClick={() => {
                                if (!pendingDelete) return;
                                remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{viewing?.name}</DialogTitle>
                        <DialogDescription>
                            {viewing?.event_name} · {viewing && BG_LABEL[viewing.background_type]}
                        </DialogDescription>
                    </DialogHeader>
                    {viewing && (
                        <SplashPreviewFrame
                            data={viewing}
                            className="mx-auto aspect-[9/19] w-full max-w-[240px]"
                        />
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
                        {viewing && (
                            <Button asChild>
                                <Link href={`/dashboard/splash-screens/${viewing.id}`}>
                                    <Pencil className="size-3.5" /> Edit
                                </Link>
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const BG_ICON: Record<BackgroundType, React.ComponentType<{ className?: string }>> = {
    image: ImageIcon,
    video: Video,
    solid_color: Palette,
    gradient: Layers,
    logo: Sparkles,
    couple_photo: Heart,
};

const BG_LABEL: Record<BackgroundType, string> = {
    image: 'Image', video: 'Video', solid_color: 'Solid Color',
    gradient: 'Gradient', logo: 'Logo', couple_photo: 'Couple Photo',
};

function SplashCard({
    splash, onView, onDelete,
}: { splash: SplashScreen; onView: () => void; onDelete: () => void }) {
    const fmt = useDateFormatter();
    const Icon = BG_ICON[splash.background_type];

    // A best-effort swatch, not a pixel-accurate preview — the full render
    // lives in the editor's own preview panel. This just gives the list
    // something more useful than an icon to scan by.
    const swatchStyle: React.CSSProperties = (() => {
        const cfg = (splash.background_config ?? {}) as Record<string, unknown>;
        if (splash.background_type === 'solid_color') {
            return { backgroundColor: String(cfg.color || '#E91E63') };
        }
        if (splash.background_type === 'gradient') {
            const c1 = String(cfg.color_1 || '#6A11CB');
            const c2 = String(cfg.color_2 || '#FF2575');
            return { backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})` };
        }
        if ((splash.background_type === 'image' || splash.background_type === 'couple_photo') && splash.background_url) {
            return { backgroundImage: `url(${splash.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        }
        return { backgroundColor: 'var(--muted)' };
    })();

    return (
        <Card className="overflow-hidden py-0">
            <button
                type="button"
                onClick={onView}
                aria-label={`View ${splash.name}`}
                className="group relative flex h-32 w-full items-center justify-center text-white"
                style={swatchStyle}
            >
                <div className="absolute inset-0 bg-black/25" />
                <Icon className="relative size-8 opacity-90 transition-opacity group-hover:opacity-0" />
                {/* Revealed on hover — pointer-events is fine here since the
                    whole swatch is already the click target underneath it. */}
                <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Eye className="size-6" />
                </span>
                <Badge variant="secondary" className="absolute top-2.5 right-2.5">
                    {splash.status === 'active' ? 'Active' : 'Draft'}
                </Badge>
            </button>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{splash.name}</p>
                        <p className="truncate text-[12px] text-muted-foreground">{splash.event_name}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8 shrink-0" aria-label="More actions">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onView}>
                                <Eye className="size-3.5" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/splash-screens/${splash.id}`}>
                                    <Pencil className="size-3.5" /> Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={onDelete}>
                                <Trash2 className="size-3.5" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[10.5px]">{BG_LABEL[splash.background_type]}</Badge>
                    {splash.sound_enabled && (
                        <Badge variant="outline" className="gap-1 text-[10.5px]"><Music className="size-3" /> Sound</Badge>
                    )}
                    {splash.animation_enabled && (
                        <Badge variant="outline" className="text-[10.5px]">Animated</Badge>
                    )}
                </div>

                <p className="mt-3 text-[11px] text-muted-foreground">
                    Updated {fmt(splash.updated_at, true)}
                </p>
            </CardContent>
        </Card>
    );
}
