"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faHeart as faHeartSolid,
    faEye,
    faSliders,
    faRotateRight,
    faLightbulb,
    faArrowRight,
    faCheck,
    faLayerGroup,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    EVENT_THEMES,
    TEMPLATE_CATEGORIES,
    TEMPLATE_STYLES,
    TEMPLATE_LAYOUTS,
    TEMPLATE_COLOR_FILTERS,
    type EventTheme,
} from "@/lib/event-themes";
import { useEventAnalytics } from "@/hooks/use-client-events";
import { useClientProfile, useSetFavouriteTemplates } from "@/hooks/use-client-portal";

/**
 * Templates — the invitation designs a client can build an event on.
 *
 * ── WHAT BACKS THIS ──────────────────────────────────────────────────────────
 * `lib/event-themes.ts`. That list is the REAL catalogue: it is what the Create
 * Event wizard offers, and what an event stores in `theme_id`. There is no
 * templates table for this, and `company_templates` in the backend belongs to
 * the Website Builder — a different domain, tied to the tenant's website rather
 * than to a client's invitation.
 *
 * So every card here is a template that genuinely works: "Use Template" opens
 * the wizard with it already selected, and the artwork is the same component
 * the event rows and cards render.
 *
 * ── WHAT IS REAL IN THE FILTER PANEL ─────────────────────────────────────────
 * Colour, Event Type, Style, Layout and Favourites Only all filter on something
 * real. The design's "Free templates only" switch was dropped rather than shown
 * disabled: every template is free, so it could never filter anything, and a
 * control that cannot change the result is worse than no control.
 *
 * "Used by your events" comes from `/client/events/analytics` (`by_theme`), so
 * the counts on the cards are the client's own real usage.
 *
 * ── FAVOURITES ───────────────────────────────────────────────────────────────
 * `website_clients.favourite_templates`, through
 * `PUT /client/favourite-templates`. This WAS localStorage, which was wrong:
 * the hearts vanished on a different browser, were invisible to anything
 * server-side, and silently did nothing in private mode where writes are
 * refused. The whole list is sent on each change rather than a toggle, because
 * a toggle endpoint races itself when two hearts are clicked quickly.
 */

const PAGE_SIZE = 8;

type SortKey = "popular" | "newest" | "name";

const SORTS: { value: SortKey; label: string }[] = [
    { value: "popular", label: "Popular" },
    { value: "newest", label: "Newest" },
    { value: "name", label: "Name A–Z" },
];

export default function TemplatesPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>("all");
    const [colour, setColour] = useState<string | null>(null);
    const [style, setStyle] = useState("all");
    const [layout, setLayout] = useState("all");
    const [sort, setSort] = useState<SortKey>("popular");
    const [favouritesOnly, setFavouritesOnly] = useState(false);
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [preview, setPreview] = useState<EventTheme | null>(null);

    // Server-held, read off the client's own profile. The mutation is optimistic
    // and rolls back on failure, so the heart still responds instantly without
    // pretending a failed save succeeded.
    const profile = useClientProfile();
    const saveFavourites = useSetFavouriteTemplates();
    const favourites = useMemo(() => profile.data?.favourite_templates ?? [], [profile.data]);

    const toggleFavourite = (id: string) => {
        const next = favourites.includes(id)
            ? favourites.filter((f) => f !== id)
            : [...favourites, id];
        saveFavourites.mutate(next);
    };

    // The client's own template usage, so the counts on the cards are real.
    const analytics = useEventAnalytics();
    const usage = useMemo(() => {
        const map = new Map<string, number>();
        for (const row of analytics.data?.by_theme ?? []) map.set(row.theme_id, row.count);
        return map;
    }, [analytics.data]);

    // Any filter change resets the page size, or "Load More" would appear to do
    // nothing when the new result set is smaller than what is already shown.
    useEffect(() => { setVisible(PAGE_SIZE); }, [search, category, colour, style, layout, sort, favouritesOnly]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        const colourMatch = TEMPLATE_COLOR_FILTERS.find((c) => c.key === colour);

        const rows = EVENT_THEMES.filter((t) => {
            if (term && !t.name.toLowerCase().includes(term) && !t.style.toLowerCase().includes(term)) return false;
            if (category !== "all" && !t.categories.includes(category as never)) return false;
            if (colourMatch && !colourMatch.match.includes(t.accent)) return false;
            if (style !== "all" && t.style !== style) return false;
            if (layout !== "all" && t.layout !== layout) return false;
            if (favouritesOnly && !favourites.includes(t.id)) return false;
            return true;
        });

        // Sorted on a copy — EVENT_THEMES is module state shared with the wizard,
        // and sorting it in place would reorder the theme picker as a side effect.
        return [...rows].sort((a, b) => {
            if (sort === "name") return a.name.localeCompare(b.name);
            if (sort === "newest") {
                const rank = (t: EventTheme) => (t.badge === "New" ? 0 : 1);
                return rank(a) - rank(b) || a.name.localeCompare(b.name);
            }
            // Popular: badged first, then whatever this client actually uses most.
            const rank = (t: EventTheme) => (t.badge === "Popular" ? 0 : t.badge === "New" ? 1 : 2);
            return rank(a) - rank(b) || (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0);
        });
    }, [search, category, colour, style, layout, sort, usage, favouritesOnly, favourites]);

    const shown = filtered.slice(0, visible);
    const activeFilters =
        (colour ? 1 : 0) + (style !== "all" ? 1 : 0) + (layout !== "all" ? 1 : 0) +
        (category !== "all" ? 1 : 0) + (favouritesOnly ? 1 : 0);

    const resetFilters = () => {
        setColour(null); setStyle("all"); setLayout("all"); setCategory("all");
        setFavouritesOnly(false);
    };

    return (
        <div className="flex flex-col gap-5">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <h1 className="text-[24px] font-bold leading-tight tracking-tight text-foreground">Templates</h1>
                    <p className="mt-1 text-[13.5px] text-muted-foreground">
                        Choose a template and customize it to create your perfect invitation.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 sm:w-[210px]">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 !size-[12px] text-muted-foreground"
                        />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search templates..."
                            aria-label="Search templates"
                            className="h-10 rounded-md pl-9 text-[13px]"
                        />
                    </div>

                    <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                        <SelectTrigger className="h-10 w-full rounded-md text-[13px] sm:w-[130px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SORTS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* ── Category tabs ───────────────────────────────────────────── */}
            <Tabs value={category} onValueChange={setCategory} className="overflow-x-auto">
                <TabsList variant="line" className="h-auto flex-nowrap gap-2 p-0">
                    <TabsTrigger
                        value="all"
                        className="h-9 rounded-md border border-border px-4 text-[12.5px] data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:after:opacity-0"
                    >
                        All Templates
                    </TabsTrigger>
                    {TEMPLATE_CATEGORIES.map((c) => (
                        <TabsTrigger
                            key={c}
                            value={c}
                            className="h-9 rounded-md border border-border px-4 text-[12.5px] data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:after:opacity-0"
                        >
                            {c}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* ── Grid + filter rail ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="flex min-w-0 flex-col gap-5">
                    {shown.length === 0 ? (
                        <Card className="border border-border shadow-none py-0">
                            <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                                <FontAwesomeIcon icon={faLayerGroup} className="!size-[26px] text-muted-foreground/40" />
                                <p className="text-[14px] font-semibold text-foreground">
                                    {favouritesOnly && favourites.length === 0 ? "No favourites yet" : "No templates match"}
                                </p>
                                <p className="text-[13px] text-muted-foreground">
                                    {favouritesOnly && favourites.length === 0
                                        ? "Tap the heart on a template to save it here."
                                        : "Try a different search, or reset the filters."}
                                </p>
                                <Button variant="outline" size="sm" className="mt-2 h-8 text-[12px]" onClick={resetFilters}>
                                    Reset filters
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {shown.map((template) => {
                                const used = usage.get(template.id) ?? 0;
                                const isFavourite = favourites.includes(template.id);
                                return (
                                    <Card
                                        key={template.id}
                                        className="min-w-0 gap-0 overflow-hidden border border-border p-0 shadow-none transition-shadow hover:shadow-md"
                                    >
                                        <div className="relative">
                                            <TemplatePreview template={template} className="aspect-square w-full" />

                                            <button
                                                type="button"
                                                onClick={() => toggleFavourite(template.id)}
                                                aria-label={isFavourite ? `Remove ${template.name} from favourites` : `Add ${template.name} to favourites`}
                                                aria-pressed={isFavourite}
                                                className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-background/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
                                            >
                                                <FontAwesomeIcon
                                                    icon={isFavourite ? faHeartSolid : faHeartOutline}
                                                    className={cn("!size-[12px]", isFavourite ? "text-destructive" : "text-muted-foreground")}
                                                />
                                            </button>

                                            {used > 0 && (
                                                <Badge
                                                    variant="ghost"
                                                    className="absolute left-2.5 top-2.5 rounded bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur-sm"
                                                >
                                                    Used {used}×
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-3 p-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* break-words, never truncate. */}
                                                <p className="text-[13px] font-bold text-foreground break-words">
                                                    {template.name}
                                                </p>
                                                {template.badge && (
                                                    <Badge
                                                        variant="ghost"
                                                        className={cn(
                                                            "rounded px-2 py-0.5 text-[10px] font-semibold",
                                                            template.badge === "New"
                                                                ? "bg-success/15 text-success"
                                                                : "bg-primary/10 text-primary"
                                                        )}
                                                    >
                                                        {template.badge}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPreview(template)}
                                                    className="h-8 flex-1 rounded-md text-[12px] font-medium"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="mr-1.5 !size-[11px]" />
                                                    Preview
                                                </Button>
                                                <Button asChild size="sm" className="h-8 flex-1 rounded-md text-[12px] font-semibold">
                                                    {/* Opens the wizard with this template
                                                        already selected — the whole point of
                                                        the screen. */}
                                                    <Link href={`/dashboard/events/create?theme=${template.id}`}>Use</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {visible < filtered.length && (
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                                className="h-10 rounded-md px-6 text-[13px] font-medium"
                            >
                                Load More Templates
                                <FontAwesomeIcon icon={faChevronDown} className="ml-2 !size-[11px]" />
                            </Button>
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <p className="text-center text-[12px] text-muted-foreground">
                            Showing {shown.length} of {filtered.length} templates
                        </p>
                    )}
                </div>

                {/* ── Filter rail ─────────────────────────────────────────── */}
                <div className="flex min-w-0 flex-col gap-5">
                    <Card className="border border-border shadow-none py-0">
                        <CardContent className="p-4">
                            <div className="mb-4 flex items-center justify-between gap-2">
                                <p className="text-[13px] font-bold text-foreground">Filter Templates</p>
                                <FontAwesomeIcon icon={faSliders} className="!size-[12px] text-muted-foreground" />
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[12px] font-medium">Color Theme</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {TEMPLATE_COLOR_FILTERS.map((c) => (
                                            <button
                                                key={c.key}
                                                type="button"
                                                aria-label={c.label}
                                                aria-pressed={colour === c.key}
                                                // Clicking the active swatch clears it —
                                                // otherwise the only way out of a colour
                                                // filter is the Reset button.
                                                onClick={() => setColour(colour === c.key ? null : c.key)}
                                                style={{ backgroundColor: c.hex }}
                                                className={cn(
                                                    "grid h-6 w-6 place-items-center rounded-full ring-offset-2 ring-offset-card transition-shadow",
                                                    colour === c.key && "ring-2 ring-foreground/50"
                                                )}
                                            >
                                                {colour === c.key && (
                                                    <FontAwesomeIcon icon={faCheck} className="!size-[9px] text-white drop-shadow" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-[12px] font-medium">Event Type</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-9 rounded-md text-[12.5px]">
                                            <SelectValue placeholder="All Event Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Event Types</SelectItem>
                                            {TEMPLATE_CATEGORIES.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-[12px] font-medium">Style</Label>
                                    <Select value={style} onValueChange={setStyle}>
                                        <SelectTrigger className="h-9 rounded-md text-[12.5px]">
                                            <SelectValue placeholder="All Styles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Styles</SelectItem>
                                            {TEMPLATE_STYLES.map((v) => (
                                                <SelectItem key={v} value={v}>{v}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-[12px] font-medium">Layout</Label>
                                    <Select value={layout} onValueChange={setLayout}>
                                        <SelectTrigger className="h-9 rounded-md text-[12.5px]">
                                            <SelectValue placeholder="All Layouts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Layouts</SelectItem>
                                            {TEMPLATE_LAYOUTS.map((v) => (
                                                <SelectItem key={v} value={v}>{v}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Was a locked "Free templates only" switch — every
                                    template is free, so it filtered nothing and read
                                    as broken. Favourites persist server-side now, so
                                    this is a toggle that does something. */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <Label className="text-[12px] font-medium">Favourites Only</Label>
                                        <p className="text-[10.5px] text-muted-foreground">
                                            {favourites.length} saved
                                        </p>
                                    </div>
                                    <Switch
                                        checked={favouritesOnly}
                                        onCheckedChange={setFavouritesOnly}
                                        disabled={favourites.length === 0}
                                        aria-label="Show favourites only"
                                    />
                                </div>

                                <Separator />

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={activeFilters === 0 && !search}
                                    onClick={() => { resetFilters(); setSearch(""); }}
                                    className="h-9 rounded-md border-primary/40 text-[12.5px] font-semibold text-primary hover:bg-primary/5 hover:text-primary"
                                >
                                    <FontAwesomeIcon icon={faRotateRight} className="mr-2 !size-[11px]" />
                                    Reset Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5 shadow-none py-0">
                        <CardContent className="p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faLightbulb} className="!size-[12px] text-primary" />
                                <p className="text-[12.5px] font-bold text-primary">Pro Tip</p>
                            </div>
                            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                                Templates set your invitation&rsquo;s look. You can change the primary colour
                                after selecting one, and switch template at any time by editing the event.
                            </p>
                            <Link
                                href="/dashboard/events/create"
                                className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:underline"
                            >
                                Start an event
                                <FontAwesomeIcon icon={faArrowRight} className="!size-[9px]" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Preview dialog ──────────────────────────────────────────── */}
            <Dialog open={!!preview} onOpenChange={(v) => { if (!v) setPreview(null); }}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>{preview?.name}</DialogTitle>
                        <DialogDescription>
                            {preview?.style} · {preview?.layout} · {preview?.categories.join(", ")}
                        </DialogDescription>
                    </DialogHeader>

                    {preview && (
                        <div className="flex flex-col gap-4">
                            <TemplatePreview template={preview} className="aspect-square w-full" large />
                            <Button asChild className="h-10 w-full rounded-md text-[13px] font-semibold">
                                <Link href={`/dashboard/events/create?theme=${preview.id}`}>
                                    Use this template
                                </Link>
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

/**
 * A template's artwork.
 *
 * Deliberately NOT `EventThumbnail` — that one is a miniature for a list row and
 * shows a real event's name. This is the empty template as the wizard's step-5
 * preview renders it, at card or dialog size. `dark` picks the ink, exactly as
 * it does there: without it the two near-black templates draw as blank squares.
 */
function TemplatePreview({
    template, className, large,
}: {
    template: EventTheme;
    className?: string;
    large?: boolean;
}) {
    const ink = template.dark ? "text-white" : "text-black";
    const muted = template.dark ? "text-white/60" : "text-black/45";
    const rule = template.dark ? "bg-white/25" : "bg-black/15";

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center bg-gradient-to-br p-4 text-center",
                template.swatch,
                className
            )}
        >
            <span
                className={cn(
                    "font-semibold uppercase tracking-[0.22em]",
                    large ? "text-[11px]" : "text-[8px]",
                    muted
                )}
            >
                You&rsquo;re invited
            </span>
            <span className={cn("mt-0.5 uppercase tracking-[0.2em]", large ? "text-[9px]" : "text-[6.5px]", muted)}>
                to
            </span>
            <span
                className={cn(
                    "mt-1.5 font-bold italic leading-tight",
                    large ? "text-[22px]" : "text-[13px]",
                    ink
                )}
                style={{ color: template.dark ? undefined : template.accent }}
            >
                Our Special Event
            </span>
            <span className={cn("mt-2.5 h-px", rule, large ? "w-16" : "w-10")} />
            <FontAwesomeIcon
                icon={faHeartSolid}
                className={cn(large ? "!size-[12px]" : "!size-[8px]", "mt-2")}
                style={{ color: template.accent }}
            />
            {large && (
                <>
                    <span className={cn("mt-3 text-[10px]", muted)}>25 May 2025 · 07:00 PM</span>
                    <span className={cn("text-[10px]", muted)}>The Grand Palace, New Delhi</span>
                </>
            )}
        </div>
    );
}
