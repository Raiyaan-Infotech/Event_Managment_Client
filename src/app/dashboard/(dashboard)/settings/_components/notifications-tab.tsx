'use client';

import { useState } from 'react';
import {
    Bell, Mail, Info, Loader2, Volume2, VolumeX, MoonStar, TriangleAlert,
    Calendar, Users, Wallet, Rocket, ClipboardList, Send,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import {
    useClientSettings, useUpdateNotifications, useUpdatePreferences,
    type NotificationGroup, type NotificationType, type DeliveryChannel,
} from '@/hooks/use-client-settings';

/**
 * Notification settings — email and in-app.
 *
 * ── ⚠ NOTHING IS DELIVERED YET, AND THE SCREEN SAYS SO ──────────────────────
 * There is no SMTP configured anywhere (`email_configs` is empty) and this
 * portal has no notification feed. These switches record what the client has
 * AGREED to, so that consent is already right on the day sending is wired.
 *
 * The banner is NOT hardcoded here — `settings.delivery` carries the state and
 * the reason per channel, so the wording is the server's and the banner
 * disappears by itself the moment a provider is configured. Hiding it instead
 * would be the §321 mistake with worse consequences: somebody switches on
 * "Account Security" alerts, believes they will be warned about a break-in, and
 * nothing can send.
 *
 * ── THE SMS TAB IS ABSENT ───────────────────────────────────────────────────
 * The design had one. There is no SMS provider at all — the mobile login OTP is
 * written to the server log with "NOT SENT — no SMS provider" — so an SMS tab
 * would be a page of switches for a channel that does not exist.
 */

export function NotificationsTab() {
    const { data, isLoading } = useClientSettings();

    if (isLoading || !data) return <NotificationsSkeleton />;

    return (
        <Tabs defaultValue="email" className="gap-5">
            <TabsList variant="line" className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="in_app">In-App</TabsTrigger>
            </TabsList>

            <TabsContent value="email"><EmailPanel /></TabsContent>
            <TabsContent value="in_app"><InAppPanel /></TabsContent>
        </Tabs>
    );
}

/* ── Email ───────────────────────────────────────────────────────────────── */

/** Which icon fronts a group header — purely visual, keyed on the server's own group name. */
function GroupIcon({ group, className }: { group: string; className?: string }) {
    switch (group) {
        case 'Event Activity': return <Calendar className={className} />;
        case 'Guests': return <Users className={className} />;
        case 'Account & Billing': return <Wallet className={className} />;
        default: return <Bell className={className} />;
    }
}

function EmailPanel() {
    const { data } = useClientSettings();
    const save = useUpdateNotifications();
    const savePrefs = useUpdatePreferences();
    if (!data) return null;

    const muted = Boolean(Number(data.preferences.emails_disabled));

    /*
      "From us" (marketing_tips / product_updates) is a pair of yes/no consent
      flags, not something to tune a frequency on — the design puts them in
      their own Email Preferences card, so they are pulled out of the main
      list here rather than rendered twice.
    */
    const mainGroups = data.notifications.email.filter((g) => g.group !== 'From us');
    const fromUs = data.notifications.email.find((g) => g.group === 'From us');
    const allEnabled = mainGroups.every((g) => g.types.every((t) => t.enabled));

    const toggleAll = (enabled: boolean) => {
        const items = mainGroups.flatMap((g) => g.types.map((t) => ({
            channel: 'email' as const, type: t.type, enabled, frequency: t.frequency,
        })));
        if (items.length) save.mutate(items);
    };

    return (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-4">
                <DeliveryNotice channel={data.delivery.email} />

                <Card className="py-0">
                    <CardContent className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold">Email Notifications</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Receive updates about your events and account by email.
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="text-[12.5px] font-medium text-primary">Select All</span>
                                <Switch
                                    checked={allEnabled}
                                    disabled={muted || save.isPending}
                                    onCheckedChange={toggleAll}
                                />
                            </div>
                        </div>

                        <div className="mt-5 hidden items-center justify-end gap-3 pr-1 text-[11px] font-medium text-muted-foreground sm:flex">
                            <span className="w-9 text-center">Email</span>
                            <span className="w-[170px] text-center">Frequency</span>
                        </div>

                        {mainGroups.map((group, gi) => (
                            <div key={group.group} className={`mt-4 pt-4 ${gi > 0 ? 'border-t' : ''}`}>
                                <div className="flex items-center gap-2.5">
                                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                                        <GroupIcon group={group.group} className="size-3.5" />
                                    </span>
                                    <h3 className="text-[13px] font-semibold">{group.group}</h3>
                                </div>

                                <div className="mt-1 flex flex-col">
                                    {group.types.map((t, i) => (
                                        <div key={t.type} className="min-w-0">
                                            {i > 0 && <Separator />}
                                            <div className="flex min-w-0 flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-medium">{t.label}</p>
                                                    <p className="mt-0.5 text-[11.5px] break-words text-muted-foreground">
                                                        {t.description}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-3">
                                                    <Switch
                                                        checked={t.enabled && !muted}
                                                        disabled={muted || save.isPending}
                                                        onCheckedChange={(enabled) =>
                                                            save.mutate([{ channel: 'email', type: t.type, enabled, frequency: t.frequency }])
                                                        }
                                                    />
                                                    {/*
                                                      The frequency stays visible but
                                                      disabled when the type is off —
                                                      removing it makes the row jump,
                                                      and the choice is remembered for
                                                      when it is switched back on.
                                                    */}
                                                    <Select
                                                        value={t.frequency}
                                                        disabled={!t.enabled || muted || save.isPending}
                                                        onValueChange={(frequency) =>
                                                            save.mutate([{ channel: 'email', type: t.type, enabled: t.enabled, frequency }])
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[170px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(t.frequencies ?? []).map((f) => (
                                                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
                <DisableAllEmailsCard
                    muted={muted}
                    pending={savePrefs.isPending}
                    onToggle={(v) => savePrefs.mutate({ emails_disabled: v })}
                />
                <EmailPreferencesCard group={fromUs} muted={muted} save={save} />
                <EmailPreviewCard delivery={data.delivery.email} />
            </div>
        </div>
    );
}

/** The mock's "Do not want any emails?" banner — same switch as before, restyled. */
function DisableAllEmailsCard({
    muted, pending, onToggle,
}: { muted: boolean; pending: boolean; onToggle: (v: boolean) => void }) {
    return (
        <Card className="py-0">
            <CardContent className="flex items-start gap-3 p-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10">
                    <Bell className="size-[17px] text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                    <h3 className="text-[13.5px] font-semibold">Do not want any emails?</h3>
                    <p className="mt-1 text-[12px] break-words text-muted-foreground">
                        You can disable all email notifications at once. Your individual
                        choices are kept, so switching this back off restores them exactly
                        as they were.
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-[12.5px] font-medium">Disable All Emails</span>
                        <Switch checked={muted} disabled={pending} onCheckedChange={onToggle} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Email Preferences — the two real consent flags from the "From us" catalog
 * group (Marketing & Tips, Product Updates), plus Surveys & Feedback shown
 * disabled with a note: the design asked for it, but there is no survey
 * feature anywhere in this system for the switch to mean anything.
 */
function EmailPreferencesCard({
    group, muted, save,
}: {
    group: NotificationGroup | undefined;
    muted: boolean;
    save: ReturnType<typeof useUpdateNotifications>;
}) {
    const marketing = group?.types.find((t) => t.type === 'marketing_tips');
    const product = group?.types.find((t) => t.type === 'product_updates');

    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <h3 className="text-[13.5px] font-semibold">Email Preferences</h3>
                <p className="mt-1 text-[12px] break-words text-muted-foreground">
                    Manage how you receive emails from us.
                </p>

                <div className="mt-4 flex flex-col gap-4">
                    {marketing && (
                        <PreferenceRow
                            icon={<Mail className="size-4 text-violet-600" />}
                            iconClassName="bg-violet-500/10"
                            title="Marketing & Tips"
                            body={marketing.description}
                            checked={marketing.enabled && !muted}
                            disabled={muted || save.isPending}
                            onCheckedChange={(enabled) =>
                                save.mutate([{ channel: 'email', type: 'marketing_tips', enabled, frequency: marketing.frequency }])
                            }
                        />
                    )}
                    {product && (
                        <PreferenceRow
                            icon={<Rocket className="size-4 text-emerald-600" />}
                            iconClassName="bg-emerald-500/10"
                            title="Product Updates"
                            body={product.description}
                            checked={product.enabled && !muted}
                            disabled={muted || save.isPending}
                            onCheckedChange={(enabled) =>
                                save.mutate([{ channel: 'email', type: 'product_updates', enabled, frequency: product.frequency }])
                            }
                        />
                    )}
                    <PreferenceRow
                        icon={<ClipboardList className="size-4 text-muted-foreground" />}
                        iconClassName="bg-muted"
                        title="Surveys & Feedback"
                        body="Not built yet — there is no survey feature in this system."
                        checked={false}
                        disabled
                        onCheckedChange={() => {}}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function PreferenceRow({
    icon, iconClassName, title, body, checked, disabled, onCheckedChange,
}: {
    icon: React.ReactNode;
    iconClassName: string;
    title: string;
    body: string;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-start gap-3">
            <span className={`grid size-8 shrink-0 place-items-center rounded-full ${iconClassName}`}>
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium">{title}</p>
                <p className="mt-0.5 text-[11px] break-words text-muted-foreground">{body}</p>
            </div>
            <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
        </div>
    );
}

/**
 * A static preview — illustrative only, not rendered from a real template
 * (there is no template wired to these notification types yet).
 *
 * ⚠ "Send Test Email" is disabled with the server's own delivery reason
 * rather than wired to a real send: no email provider is configured, and per
 * §this-session that stays out until one is — a button that mostly does
 * nothing yet is worse than a disabled one that says why.
 */
function EmailPreviewCard({ delivery }: { delivery: DeliveryChannel }) {
    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <h3 className="text-[13.5px] font-semibold">Email Preview</h3>
                <p className="mt-1 text-[12px] break-words text-muted-foreground">
                    This is how emails from Event Invit would appear in your inbox.
                </p>

                <div className="mt-4 rounded-lg border p-3.5">
                    <div className="flex items-center gap-2.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-rose-500/15 text-[11px] font-bold text-rose-600">
                            EI
                        </span>
                        <div className="min-w-0">
                            <p className="text-[12.5px] font-semibold">Event Invit</p>
                            <p className="text-[11px] text-muted-foreground">hello@eventinvit.com</p>
                        </div>
                    </div>
                    <p className="mt-3 text-[11.5px] break-words text-muted-foreground">
                        Subject:{' '}
                        <span className="text-foreground">
                            Your event &quot;Annual Meetup 2025&quot; is coming up!
                        </span>
                    </p>
                    <p className="mt-2 text-[12px] break-words leading-relaxed text-muted-foreground">
                        Hi there,
                        <br />
                        Just a quick reminder that your event &quot;Annual Meetup 2025&quot; is
                        happening soon. We look forward to celebrating with you!
                        <br />
                        — Team Event Invit
                    </p>
                </div>

                <Button variant="outline" className="mt-4 w-full" disabled>
                    <Send className="size-4" /> Send Test Email
                </Button>
                <p className="mt-2 text-[11px] break-words text-muted-foreground">
                    {delivery.enabled
                        ? 'A provider is connected, but sending a test email from this screen isn’t wired up yet.'
                        : delivery.reason}
                </p>
            </CardContent>
        </Card>
    );
}

/* ── In-app ──────────────────────────────────────────────────────────────── */

function InAppPanel() {
    const { data } = useClientSettings();
    const save = useUpdateNotifications();
    const savePrefs = useUpdatePreferences();
    if (!data) return null;

    const muted = Boolean(Number(data.preferences.in_app_disabled));

    return (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-4">
                <DeliveryNotice channel={data.delivery.in_app} />

                {data.notifications.in_app.map((group) => (
                    <Card key={group.group} className="py-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-base font-semibold">{group.group}</h2>
                                <div className="hidden shrink-0 items-center gap-8 pr-1 text-[11px] font-medium text-muted-foreground sm:flex">
                                    <span>Show</span><span>Sound</span>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col">
                                {group.types.map((t, i) => (
                                    <div key={t.type} className="min-w-0">
                                        {i > 0 && <Separator />}
                                        <div className="flex min-w-0 flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-medium">{t.label}</p>
                                                <p className="mt-0.5 text-[11.5px] break-words text-muted-foreground">
                                                    {t.description}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-8">
                                                <Switch
                                                    checked={t.enabled && !muted}
                                                    disabled={muted || save.isPending}
                                                    onCheckedChange={(enabled) =>
                                                        save.mutate([{ channel: 'in_app', type: t.type, enabled, sound: t.sound }])
                                                    }
                                                />
                                                {/* Sound depends on the notification
                                                    showing at all, so it follows it. */}
                                                <button
                                                    type="button"
                                                    aria-label={t.sound ? `Mute ${t.label}` : `Play a sound for ${t.label}`}
                                                    disabled={!t.enabled || muted || save.isPending}
                                                    onClick={() =>
                                                        save.mutate([{ channel: 'in_app', type: t.type, enabled: t.enabled, sound: !t.sound }])
                                                    }
                                                    className="rounded p-1.5 text-muted-foreground disabled:opacity-40 hover:text-foreground"
                                                >
                                                    {t.sound
                                                        ? <Volume2 className="size-4 text-primary" />
                                                        : <VolumeX className="size-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex min-w-0 flex-col gap-4">
                <Card className="py-0">
                    <CardContent className="p-6">
                        <span className="grid size-9 place-items-center rounded-full bg-primary/10">
                            <Bell className="size-[17px] text-primary" />
                        </span>
                        <h2 className="mt-3 text-[13.5px] font-semibold">Turn off all in-app alerts</h2>
                        <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                            Overrides everything on this tab, and keeps your individual choices.
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-[12.5px] font-medium">Disable all</span>
                            <Switch
                                checked={muted}
                                disabled={savePrefs.isPending}
                                onCheckedChange={(v) => savePrefs.mutate({ in_app_disabled: v })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <DoNotDisturbCard />

                <WhatIsMissing
                    lines={[
                        'Guest check-in — nothing in this system records a check-in.',
                        'Messages — messaging is paused and not built.',
                    ]}
                />
            </div>
        </div>
    );
}

/* ── Do Not Disturb ──────────────────────────────────────────────────────── */

const MUTE_CHOICES = [
    { value: '60', label: '1 hour' },
    { value: '240', label: '4 hours' },
    { value: '480', label: '8 hours' },
    { value: '1440', label: '24 hours' },
];

/**
 * Quiet hours, stored as a WINDOW.
 *
 * The design had a switch plus a duration plus a start time. A switch has to be
 * turned back off by something, and §314 established there is no scheduled job
 * here that reliably runs — so it would stay on forever. Two timestamps expire
 * by comparison with the clock, and the server decides `dnd_active` so three
 * screens cannot decide it three different ways.
 */
function DoNotDisturbCard() {
    const { data } = useClientSettings();
    const save = useUpdatePreferences();
    const [minutes, setMinutes] = useState('60');
    if (!data) return null;

    const active = data.dnd_active;
    const endsAt = data.preferences.dnd_ends_at;

    return (
        <Card className="py-0">
            <CardContent className="p-6">
                <span className="grid size-9 place-items-center rounded-full bg-primary/10">
                    <MoonStar className="size-[17px] text-primary" />
                </span>
                <h2 className="mt-3 text-[13.5px] font-semibold">Do Not Disturb</h2>
                <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                    {active
                        ? 'Quiet until the time below. In-app alerts are held back until then.'
                        : 'Pause in-app alerts for a while. It switches itself back on when the time is up.'}
                </p>

                {active ? (
                    <>
                        <p className="mt-3 rounded-md border bg-muted/40 px-3 py-2 text-[12px] break-words">
                            Quiet until{' '}
                            <strong>
                                {endsAt ? new Date(endsAt).toLocaleString(undefined, {
                                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
                                }) : '—'}
                            </strong>
                        </p>
                        <Button
                            variant="outline" size="sm" className="mt-3 w-full"
                            disabled={save.isPending}
                            onClick={() => save.mutate({ dnd_starts_at: null, dnd_ends_at: null })}
                        >
                            {save.isPending && <Loader2 className="size-3.5 animate-spin" />}
                            Turn off Do Not Disturb
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="mt-3">
                            <Select value={minutes} onValueChange={setMinutes}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {MUTE_CHOICES.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>Mute for {m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            size="sm" className="mt-3 w-full"
                            disabled={save.isPending}
                            onClick={() => {
                                /*
                                  Starts NOW rather than at a time typed in. The
                                  design offered a start time, and a window that
                                  begins later is a promise nothing here keeps —
                                  no job wakes up to begin it, so it would only
                                  take effect if the person happened to look.
                                */
                                const now = new Date();
                                save.mutate({
                                    dnd_starts_at: now.toISOString(),
                                    dnd_ends_at: new Date(now.getTime() + Number(minutes) * 60000).toISOString(),
                                });
                            }}
                        >
                            {save.isPending && <Loader2 className="size-3.5 animate-spin" />}
                            Start Do Not Disturb
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

/* ── Shared ──────────────────────────────────────────────────────────────── */

/**
 * The channel's real delivery state, printed from the API's own reason string.
 * When the backend stops reporting a problem this disappears on its own — no
 * component has to be found and edited.
 */
function DeliveryNotice({ channel }: { channel: DeliveryChannel }) {
    if (channel.enabled) return null;
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            <div className="min-w-0">
                <p className="text-[13px] font-semibold text-warning">Not being delivered yet</p>
                <p className="mt-1 text-[12.5px] break-words text-muted-foreground">{channel.reason}</p>
            </div>
        </div>
    );
}

/** Names what the design asked for and this system cannot raise. */
function WhatIsMissing({ lines }: { lines: string[] }) {
    return (
        <Card className="py-0">
            <CardContent className="p-6">
                <p className="flex items-center gap-2 text-[13px] font-semibold">
                    <Info className="size-3.5 shrink-0 text-muted-foreground" />
                    Not listed here
                </p>
                <ul className="mt-2.5 flex flex-col gap-1.5">
                    {lines.map((l) => (
                        <li key={l} className="text-[11.5px] break-words text-muted-foreground">{l}</li>
                    ))}
                </ul>
                <p className="mt-2.5 text-[11.5px] break-words text-muted-foreground">
                    A switch for something that can never happen is a switch wired to nothing.
                </p>
            </CardContent>
        </Card>
    );
}

function NotificationsSkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex flex-col gap-4">
                {[0, 1, 2].map((i) => (
                    <Card key={i} className="py-0">
                        <CardContent className="flex flex-col gap-4 p-6">
                            <Skeleton className="h-5 w-40" />
                            {[0, 1].map((j) => (
                                <div key={j} className="flex items-center justify-between gap-6">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-8 w-40" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Skeleton className="h-40 w-full" />
        </div>
    );
}

export type { NotificationGroup, NotificationType };
