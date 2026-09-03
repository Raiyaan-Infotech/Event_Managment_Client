'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
    Info, RotateCcw, Loader2, Monitor, Globe, SlidersHorizontal, Mail, HelpCircle, ArrowUpRight,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import {
    useClientSettings, useUpdatePreferences, type ClientPreferences,
} from '@/hooks/use-client-settings';
import { browserTimeZone, supportedTimeZones } from '@/lib/format';

/**
 * Preferences.
 *
 * ── EVERY DROPDOWN IS BUILT FROM THE SERVER'S OWN OPTION LIST ───────────────
 * `settings.options` is the same list the server validates against. A `<Select>`
 * with its choices typed in here would eventually offer a value the server
 * refuses, and the client would see a save fail for no visible reason.
 *
 * ── "SAVED, NOT YET APPLIED" IS DRIVEN BY DATA ──────────────────────────────
 * Not every preference changes something yet. `settings.applied` says which do;
 * the badge below reads that map rather than a list typed into this file, so a
 * preference unlocks the day the backend flips its flag and nobody has to
 * remember this component exists. It is the §316 rule, applied to a form.
 *
 * ── EMAIL TOGGLES ARE NOT DUPLICATED HERE ───────────────────────────────────
 * The supplied design put "Marketing Emails / Product Updates / Event
 * Reminders" on BOTH this screen and the Notifications screen, with different
 * names on each. Two editors for one setting is two places for it to diverge
 * (§308), so they live on Notifications only and this screen links across.
 */

/** Time zones the browser can actually resolve; see lib/format.ts. */
function useTimeZoneOptions(current: string | undefined) {
    return useMemo(() => {
        const zones = supportedTimeZones();
        const here = browserTimeZone();
        const set = new Set(zones);
        // A stored zone that this browser does not list must still be selectable,
        // or opening the screen silently changes it to whatever renders first.
        if (current && !set.has(current)) zones.unshift(current);
        return { zones, here };
    }, [current]);
}

export function PreferencesTab() {
    const { data, isLoading } = useClientSettings();
    const save = useUpdatePreferences();
    const { setTheme } = useTheme();

    const prefs = data?.preferences;
    const { zones, here } = useTimeZoneOptions(prefs?.time_zone);

    if (isLoading || !data || !prefs) return <PreferencesSkeleton />;

    const set = (patch: Partial<ClientPreferences>) => {
        // Theme is pushed into next-themes immediately as well as saved: waiting
        // for the round trip to repaint makes a colour change feel broken.
        if (patch.theme) setTheme(patch.theme);
        save.mutate(patch);
    };

    const bool = (v: boolean | number | undefined) => Boolean(Number(v ?? 0));
    const notApplied = (key: string) => data.applied[key] === false;

    return (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-4">
                <Card className="py-0">
                    <CardContent className="p-6">
                        <CardHead
                            icon={<Globe className="size-4" />}
                            title="General Preferences"
                            body="Set your language, and how dates and times are shown to you."
                        />

                        <div className="mt-5 flex flex-col">
                            <Row
                                label="Language"
                                help={
                                    data.options.language_code.length > 1
                                        ? 'Choose your preferred language.'
                                        : 'Only English is available — no other language has been added to this system yet.'
                                }
                                notApplied={notApplied('language_code')}
                            >
                                <Choice
                                    value={prefs.language_code}
                                    options={data.options.language_code}
                                    disabled={data.options.language_code.length < 2 || save.isPending}
                                    onChange={(v) => set({ language_code: v })}
                                />
                            </Row>
                            <Separator />
                            <Row
                                label="Date Format"
                                help="How dates are displayed across the portal."
                                notApplied={notApplied('date_format')}
                            >
                                <Choice
                                    value={prefs.date_format}
                                    options={data.options.date_format}
                                    disabled={save.isPending}
                                    onChange={(v) => set({ date_format: v })}
                                />
                            </Row>
                            <Separator />
                            <Row
                                label="Time Zone"
                                help={here ? `Times are shown in this zone. This device is in ${here}.` : 'Times are shown in this zone.'}
                                notApplied={notApplied('time_zone')}
                            >
                                {/* Not from `options` — the zone list is the
                                    BROWSER's, which is a real list rather than a
                                    hand-typed selection that goes stale. */}
                                <Select
                                    value={prefs.time_zone}
                                    disabled={save.isPending}
                                    onValueChange={(v) => set({ time_zone: v })}
                                >
                                    <SelectTrigger className="w-full sm:w-[260px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {zones.map((z) => (
                                            <SelectItem key={z} value={z}>{z.replace(/_/g, ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Row>
                        </div>
                    </CardContent>
                </Card>

                <Card className="py-0">
                    <CardContent className="p-6">
                        <CardHead
                            icon={<Monitor className="size-4" />}
                            title="Display Preferences"
                            body="How the portal looks and behaves for you."
                        />

                        <div className="mt-5 flex flex-col">
                            <Row label="Theme" help="Light, dark, or follow your device."
                                notApplied={notApplied('theme')}>
                                <Choice
                                    value={prefs.theme}
                                    options={data.options.theme}
                                    disabled={save.isPending}
                                    onChange={(v) => set({ theme: v as ClientPreferences['theme'] })}
                                />
                            </Row>
                            <Separator />
                            <Row label="Default View" help="Where the portal opens when you arrive."
                                notApplied={notApplied('default_landing')}>
                                <Choice
                                    value={prefs.default_landing}
                                    options={data.options.default_landing}
                                    disabled={save.isPending}
                                    onChange={(v) => set({ default_landing: v })}
                                />
                            </Row>
                            <Separator />
                            <Row label="Items Per Page" help="How many rows lists and tables show at once."
                                notApplied={notApplied('items_per_page')}>
                                <Choice
                                    value={String(prefs.items_per_page)}
                                    options={data.options.items_per_page}
                                    disabled={save.isPending}
                                    onChange={(v) => set({ items_per_page: Number(v) })}
                                />
                            </Row>
                        </div>
                    </CardContent>
                </Card>

                <Card className="py-0">
                    <CardContent className="p-6">
                        <CardHead
                            icon={<SlidersHorizontal className="size-4" />}
                            title="Other Preferences"
                            body="Small behaviours you can turn on or off."
                        />

                        <div className="mt-5 flex flex-col">
                            <Row label="Compact Mode" help="Show more content in less space."
                                notApplied={notApplied('compact_mode')}>
                                <Switch
                                    checked={bool(prefs.compact_mode)}
                                    disabled={save.isPending}
                                    onCheckedChange={(v) => set({ compact_mode: v })}
                                />
                            </Row>
                            <Separator />
                            <Row label="Auto Save" help="Save changes as you make them."
                                notApplied={notApplied('auto_save')}>
                                <Switch
                                    checked={bool(prefs.auto_save)}
                                    disabled={save.isPending}
                                    onCheckedChange={(v) => set({ auto_save: v })}
                                />
                            </Row>
                            <Separator />
                            <Row label="Show Helpful Tips" help="Show tips and suggestions around the portal."
                                notApplied={notApplied('show_tips')}>
                                <Switch
                                    checked={bool(prefs.show_tips)}
                                    disabled={save.isPending}
                                    onCheckedChange={(v) => set({ show_tips: v })}
                                />
                            </Row>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
                <Card className="py-0">
                    <CardContent className="p-6">
                        <span className="grid size-9 place-items-center rounded-full bg-primary/10">
                            <Info className="size-[17px] text-primary" />
                        </span>
                        <h2 className="mt-3 text-[13.5px] font-semibold">About Preferences</h2>
                        <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                            These apply to your account, not to your event guests, and follow you
                            between your devices. Every change saves straight away.
                        </p>
                        {/* Only shown when something really is unapplied, and the
                            count comes from the data. */}
                        {Object.values(data.applied).some((v) => v === false) && (
                            <p className="mt-3 rounded-md border bg-muted/40 p-3 text-[11.5px] break-words text-muted-foreground">
                                A few preferences are marked <em>saved, not applied yet</em>. Those are
                                stored against your account but nothing reads them so far — they will
                                start working without you having to set them again.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="py-0">
                    <CardContent className="p-6">
                        <span className="grid size-9 place-items-center rounded-full bg-primary/10">
                            <Mail className="size-[17px] text-primary" />
                        </span>
                        <h2 className="mt-3 text-[13.5px] font-semibold">Email preferences</h2>
                        <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                            Which emails you get is set on the Notifications tab, so there is only one
                            place to change it.
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                            <Link href="/dashboard/settings?tab=notifications">Go to Notifications</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/*
                  ⚠ Design-only, per this session — the mock's four links
                  (Managing Preferences, Email Settings Guide, Account Settings
                  Guide, Help Center) have no real page behind any of them yet,
                  so these are plain text, not `<Link>`s. A link to a route that
                  does not exist reads as a broken portal; unclickable text that
                  looks the same does not promise a destination it can't reach.
                */}
                <Card className="py-0">
                    <CardContent className="p-6">
                        <span className="grid size-9 place-items-center rounded-full bg-primary/10">
                            <HelpCircle className="size-[17px] text-primary" />
                        </span>
                        <h2 className="mt-3 text-[13.5px] font-semibold">Need Help?</h2>
                        <div className="mt-3 flex flex-col gap-2.5">
                            {[
                                'Managing Preferences',
                                'Email Settings Guide',
                                'Account Settings Guide',
                                'Help Center',
                            ].map((label) => (
                                <span
                                    key={label}
                                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground"
                                >
                                    {label}
                                    <ArrowUpRight className="size-3.5" />
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="py-0">
                    <CardContent className="p-6">
                        <span className="grid size-9 place-items-center rounded-full bg-warning/15">
                            <RotateCcw className="size-[17px] text-warning" />
                        </span>
                        <h2 className="mt-3 text-[13.5px] font-semibold">Reset Preferences</h2>
                        <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                            Put everything on this tab back to its default. Your notification choices
                            are not affected.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full border-warning/50"
                            disabled={save.isPending}
                            onClick={() => {
                                /*
                                  The defaults come from the SERVER (read off the
                                  model's column defaults), so a reset lands exactly
                                  where a brand-new account starts. A list typed in
                                  here would drift from the schema the first time a
                                  default changed.
                                */
                                const { theme, ...rest } = data.defaults ?? {};
                                if (theme) setTheme(theme as ClientPreferences['theme']);
                                save.mutate({ ...rest, ...(theme ? { theme } : {}) } as Partial<ClientPreferences>);
                            }}
                        >
                            {save.isPending && <Loader2 className="size-3.5 animate-spin" />}
                            Reset to Defaults
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function CardHead({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                {icon}
            </span>
            <div className="min-w-0">
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="mt-0.5 text-[12.5px] break-words text-muted-foreground">{body}</p>
            </div>
        </div>
    );
}

function Row({
    label, help, notApplied, children,
}: {
    label: string; help: string; notApplied?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium">{label}</p>
                    {notApplied && (
                        <span
                            title="Your choice is stored against your account, but nothing reads it yet."
                            className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10.5px] font-medium text-warning"
                        >
                            saved, not applied yet
                        </span>
                    )}
                </div>
                <p className="mt-0.5 text-[11.5px] break-words text-muted-foreground">{help}</p>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function Choice({
    value, options, disabled, onChange,
}: {
    value: string;
    options: { value: string | number; label: string }[];
    disabled?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <Select value={String(value)} disabled={disabled} onValueChange={onChange}>
            <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((o) => (
                    <SelectItem key={String(o.value)} value={String(o.value)}>{o.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function PreferencesSkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex flex-col gap-4">
                {[0, 1, 2].map((i) => (
                    <Card key={i} className="py-0">
                        <CardContent className="flex flex-col gap-4 p-6">
                            <Skeleton className="h-5 w-48" />
                            {[0, 1, 2].map((j) => (
                                <div key={j} className="flex items-center justify-between gap-6">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-9 w-[220px]" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Skeleton className="h-48 w-full" />
        </div>
    );
}
