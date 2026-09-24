'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Bell, Users, UserCheck, User, Send, CalendarClock,
    Smartphone, Apple, Info, AlertTriangle,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    useComposer, usePreviewAudience, useSendMessage, useMyDevices,
    type PushOptions, type SendPayload, type SendResult, type AudiencePreview,
} from '@/hooks/use-messages';
import { useParticipants } from '@/hooks/use-guests';

/**
 * The push notification composer — Content, Audience, Schedule, Preview.
 *
 * ── ONE COMPONENT, THREE PAGES ──────────────────────────────────────────────
 * "Send Push Notification" and "Schedule Push Notification" are the SAME form
 * with a different default for one radio group, which is why they share this
 * rather than existing twice. Two copies would have drifted the moment a field
 * was added to one of them, and the field most likely to be added is a
 * delivery option that matters equally to both.
 *
 * ── ⚠ WHAT THE MOCKUP OFFERS AND THIS DOES NOT ──────────────────────────────
 * SOUND: gone entirely. Custom sound must be COMPILED INTO the app bundle, so
 * it cannot be chosen at send time; and Default-vs-Silent is overridden by the
 * guest's own notification settings on both platforms. Every notification uses
 * the device default.
 *
 * IMAGE, ACTION TYPE, BADGE, EXTRA DATA, EXPIRY, DELIVERY TOGGLES: removed.
 * They were Firebase's vocabulary rather than a host's, and two of them were
 * actively misleading — the badge count guests see comes from their unread
 * list in this portal rather than from FCM, and the action type offered a
 * deep link when every notification now opens the same Notifications screen.
 * PRIORITY is the one that survived, and it sits in step 1 with the content.
 *
 * ── THE RECIPIENT COUNT IS THE SERVER'S ─────────────────────────────────────
 * Never computed here from the guest list. Push reachability depends on
 * whether each guest has an app install with a live device token, which is a
 * different table this screen cannot see. Asking the server is also what makes
 * the "why is it zero" explanation possible.
 */

type Audience = 'all' | 'groups' | 'guests';

export interface PushComposerProps {
    /** Which radio the Schedule step starts on. The only difference between
     *  the Send page and the Schedule page. */
    defaultSchedule?: 'now' | 'later';
    onSent?: (result: SendResult) => void;
}

/*
  Priority is the only push option this form still sets. Badge, expiry (TTL),
  extra data and the delivery toggles were removed: every one of them is
  Firebase's vocabulary rather than a host's, and the badge in particular was
  misleading — the count guests actually see comes from their unread list in
  this portal, not from FCM.

  The server still accepts the rest and its own defaults still apply, so
  nothing about delivery changed; they are simply no longer a decision put to
  the person writing the notification.
*/
const DEFAULT_OPTIONS: PushOptions = {
    priority: 'high',
};

export function PushComposer({ defaultSchedule = 'now', onSent }: PushComposerProps) {
    /* ── Content ─────────────────────────────────────────────────────────── */
    const [eventId, setEventId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    /* ── Audience ────────────────────────────────────────────────────────── */
    const [audience, setAudience] = useState<Audience>('all');
    const [groupIds, setGroupIds] = useState<number[]>([]);
    const [guestIds, setGuestIds] = useState<number[]>([]);

    /* ── Schedule ────────────────────────────────────────────────────────── */
    const [when, setWhen] = useState<'now' | 'later'>(defaultSchedule);
    const [scheduledAt, setScheduledAt] = useState('');

    /* ── Delivery ────────────────────────────────────────────────────────── */
    const [options, setOptions] = useState<PushOptions>(DEFAULT_OPTIONS);

    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [platform, setPlatform] = useState<'android' | 'ios'>('android');

    const composer = useComposer(eventId);
    const devices = useMyDevices();
    const preview = usePreviewAudience();
    const send = useSendMessage(onSent);

    /* Memoised because the effect below depends on it: a fresh `[]` on every
       render would re-run the "pick the first event" effect forever. */
    const events = useMemo(() => composer.data?.events ?? [], [composer.data]);
    const groups = composer.data?.groups ?? [];

    /* First event, once. Not in a render body — that would fight the user's
       own choice on every refetch. */
    useEffect(() => {
        if (eventId === null && events.length) setEventId(events[0].id);
    }, [events, eventId]);

    const pushChannel = useMemo(
        () => composer.data?.channels?.find((c) => c.channel === 'push'),
        [composer.data],
    );

    /* ── Audience preview ────────────────────────────────────────────────── */

    const [audiencePreview, setAudiencePreview] = useState<AudiencePreview | null>(null);

    useEffect(() => {
        if (!eventId) return;
        let cancelled = false;
        preview.mutateAsync({
            event_id: eventId,
            channel: 'push',
            audience,
            group_ids: groupIds,
            guest_ids: guestIds,
            body: message || ' ',
        }).then((data) => { if (!cancelled) setAudiencePreview(data); })
            .catch(() => { if (!cancelled) setAudiencePreview(null); });
        return () => { cancelled = true; };
        // `preview` is a stable mutation object; including it re-runs forever.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, audience, groupIds, guestIds]);

    const recipients = audiencePreview?.total_recipients ?? 0;

    /* ── Submit ──────────────────────────────────────────────────────────── */

    const setOption = <K extends keyof PushOptions>(key: K, value: PushOptions[K]) =>
        setOptions((prev) => ({ ...prev, [key]: value }));

    const submit = () => {
        const next: Record<string, boolean> = {};
        if (!eventId) next.event = true;
        if (!title.trim()) next.title = true;
        if (!message.trim()) next.message = true;
        if (when === 'later' && !scheduledAt) next.schedule = true;
        setErrors(next);
        if (Object.keys(next).length) return;

        const payload: SendPayload = {
            event_id: eventId!,
            channel: 'push',
            kind: 'update',
            audience,
            group_ids: audience === 'groups' ? groupIds : undefined,
            guest_ids: audience === 'guests' ? guestIds : undefined,
            subject: title.trim(),
            body: message.trim(),
            /* Every notification opens the app's Notifications list. There is
               no per-message action to choose any more, so this is stated once
               here rather than read off a control. */
            click_action: 'open_app',
            deep_link: null,
            push_options: options,
            ...(when === 'later'
                ? {
                    scheduled_at: new Date(scheduledAt).toISOString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }
                : {}),
        };
        send.mutate(payload);
    };

    /* ── Render ──────────────────────────────────────────────────────────── */

    return (
        <div className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_360px]">
            {/* ── 1. Content ─────────────────────────────────────────────── */}
            <Card className="lg:col-span-1">
                <CardContent className="flex flex-col gap-4 p-5">
                    <SectionTitle n={1} title="Notification Content" />

                    <Field label="Event" required error={errors.event}>
                        <Select
                            value={eventId ? String(eventId) : undefined}
                            onValueChange={(v) => { setEventId(Number(v)); setErrors({}); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events.map((e) => (
                                    <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Title" required error={errors.title} hint={`${title.length}/100`}>
                        <Input
                            value={title}
                            maxLength={100}
                            placeholder="Wedding Invitation"
                            onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
                            aria-invalid={errors.title || undefined}
                        />
                    </Field>

                    <Field label="Message" required error={errors.message} hint={`${message.length}/250`}>
                        <Textarea
                            value={message}
                            maxLength={250}
                            rows={4}
                            placeholder="You are invited to the wedding celebration…"
                            onChange={(e) => { setMessage(e.target.value); setErrors({}); }}
                            aria-invalid={errors.message || undefined}
                        />
                    </Field>

                    <Field
                        label="Priority"
                        note="High wakes the device immediately. Normal may be batched to save battery."
                    >
                        <div className="flex gap-1.5">
                            <Pill
                                label="High"
                                selected={options.priority !== 'normal'}
                                onSelect={() => setOption('priority', 'high')}
                            />
                            <Pill
                                label="Normal"
                                selected={options.priority === 'normal'}
                                onSelect={() => setOption('priority', 'normal')}
                            />
                        </div>
                    </Field>
                </CardContent>
            </Card>

            {/* ── 2 + 3. Audience and Schedule ───────────────────────────── */}
            <div className="flex flex-col gap-4">
                <Card>
                    <CardContent className="flex flex-col gap-3 p-5">
                        <SectionTitle n={2} title="Target Audience" />

                        <ChoiceRow
                            icon={Users}
                            label="All Guests"
                            hint="Everyone invited to this event"
                            selected={audience === 'all'}
                            onSelect={() => setAudience('all')}
                        />
                        <ChoiceRow
                            icon={UserCheck}
                            label="Guests by Group"
                            hint="Send to one or more guest groups"
                            selected={audience === 'groups'}
                            onSelect={() => setAudience('groups')}
                        />
                        {audience === 'groups' ? (
                            <div className="flex flex-wrap gap-1.5 ps-8">
                                {groups.length === 0 ? (
                                    <p className="text-[12px] text-muted-foreground">
                                        No guest groups on this event yet.
                                    </p>
                                ) : groups.map((g) => {
                                    const on = groupIds.includes(g.id);
                                    return (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => setGroupIds((prev) => (
                                                on ? prev.filter((x) => x !== g.id) : [...prev, g.id]
                                            ))}
                                            className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
                                                on
                                                    ? 'border-pink-500/60 bg-pink-500/10 text-pink-600 dark:text-pink-400'
                                                    : 'border-border text-muted-foreground hover:border-foreground/30'
                                            }`}
                                        >
                                            {g.name}
                                            <span className="ms-1 opacity-60">{g.guest_count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : null}
                        <ChoiceRow
                            icon={User}
                            label="Specific Guests"
                            hint="Pick individual guests from the guest list"
                            selected={audience === 'guests'}
                            onSelect={() => setAudience('guests')}
                        />
                        {audience === 'guests' ? (
                            <GuestPicker
                                eventId={eventId}
                                selected={guestIds}
                                onToggle={(id) => setGuestIds((prev) => (
                                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                                ))}
                            />
                        ) : null}

                        <Separator className="my-1" />

                        {/* The reachable count, and why it is what it is. */}
                        <AudienceSummary
                            preview={audiencePreview}
                            pushEnabled={Boolean(pushChannel?.enabled)}
                            hasOwnDevice={Boolean(devices.data?.push_enabled)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex flex-col gap-3 p-5">
                        <SectionTitle n={3} title="Schedule" muted="Optional" />
                        <ChoiceRow
                            icon={Send}
                            label="Send Now"
                            hint="Deliver immediately"
                            selected={when === 'now'}
                            onSelect={() => { setWhen('now'); setErrors({}); }}
                        />
                        <ChoiceRow
                            icon={CalendarClock}
                            label="Schedule for Later"
                            hint="Choose a date and time to send"
                            selected={when === 'later'}
                            onSelect={() => { setWhen('later'); setErrors({}); }}
                        />
                        {when === 'later' ? (
                            <div className="flex flex-col gap-1.5 ps-8">
                                <Input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e) => { setScheduledAt(e.target.value); setErrors({}); }}
                                    aria-invalid={errors.schedule || undefined}
                                />
                                {/* The server refuses a time already past rather than
                                    firing immediately — quietly sending now is the one
                                    outcome that cannot be undone. */}
                                <span className="text-[11px] text-muted-foreground">
                                    Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                </span>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>

            {/* ── 4. Preview ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
                <Card>
                    <CardContent className="flex flex-col gap-3 p-5">
                        <SectionTitle n={4} title="Preview" />

                        <div className="flex gap-1.5">
                            {(['android', 'ios'] as const).map((p) => (
                                <Button
                                    key={p}
                                    type="button"
                                    size="sm"
                                    variant={platform === p ? 'default' : 'outline'}
                                    className="h-7 flex-1 text-[12px]"
                                    onClick={() => setPlatform(p)}
                                >
                                    {p === 'android'
                                        ? <Smartphone className="size-3.5" />
                                        : <Apple className="size-3.5" />}
                                    {p === 'android' ? 'Android' : 'iOS'}
                                </Button>
                            ))}
                        </div>

                        <NotificationPreview
                            title={title}
                            body={message}
                            platform={platform}
                        />

                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                            A preview, not a guarantee — the real appearance varies by device,
                            OS version and the person&apos;s own notification settings.
                        </p>
                    </CardContent>
                </Card>

                {/* The channel's own words about whether this can be delivered. */}
                {pushChannel && !pushChannel.enabled ? (
                    <Card className="border-amber-500/40 bg-amber-500/5">
                        <CardContent className="flex gap-2.5 p-4">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="min-w-0">
                                <p className="text-[12.5px] font-medium">Not delivering yet</p>
                                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                                    {pushChannel.reason}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                <div className="flex flex-col gap-2">
                    <Button
                        onClick={submit}
                        disabled={send.isPending || recipients === 0}
                        className="w-full"
                    >
                        {when === 'later'
                            ? <CalendarClock className="size-4" />
                            : <Send className="size-4" />}
                        {send.isPending
                            ? 'Working…'
                            : when === 'later' ? 'Schedule Notification' : 'Send Notification'}
                    </Button>
                    {recipients === 0 ? (
                        <p className="text-center text-[11.5px] text-muted-foreground">
                            Nobody to send to yet.
                        </p>
                    ) : null}
                </div>
            </div>
        </div>

        </div>
    );
}

/* ── Guest picker ─────────────────────────────────────────────────────────── */

/**
 * Choosing individual guests, with a search box.
 *
 * ── ⚠ SEARCH IS THE SERVER'S, AND SELECTION SURVIVES IT ─────────────────────
 * The list is paginated, so filtering in the browser would search one page and
 * report that nobody matched. `selected` is therefore held by the PARENT and
 * only rendered here: a guest ticked and then searched away from is still
 * ticked, and still sent to, which is what anyone building a list of ten
 * people across three searches expects.
 */
function GuestPicker({
    eventId, selected, onToggle,
}: {
    eventId: number | null;
    selected: number[];
    onToggle: (id: number) => void;
}) {
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // An event's participants — the phone book has no event (§581).
    const { data, isLoading } = useParticipants({
        event_id: eventId ?? undefined,
        search: debounced || undefined,
        limit: 25,
    }, !!eventId);
    const guests = data?.data ?? [];

    if (!eventId) {
        return <p className="ps-8 text-[12px] text-muted-foreground">Choose an event first.</p>;
    }

    return (
        <div className="flex flex-col gap-2 ps-8">
            <Input
                value={search}
                placeholder="Search guests…"
                className="h-8 text-[12.5px]"
                onChange={(e) => setSearch(e.target.value)}
            />

            {selected.length ? (
                <p className="text-[11.5px] text-muted-foreground">
                    {selected.length} selected
                    {debounced ? ' — selections are kept while you search' : ''}
                </p>
            ) : null}

            <div className="max-h-48 overflow-y-auto rounded-md border border-border/60">
                {isLoading ? (
                    <p className="p-2.5 text-[12px] text-muted-foreground">Loading guests…</p>
                ) : guests.length === 0 ? (
                    <p className="p-2.5 text-[12px] text-muted-foreground">
                        {debounced ? 'No guest matches that search.' : 'No guests on this event yet.'}
                    </p>
                ) : guests.map((g) => {
                    const on = selected.includes(g.id);
                    return (
                        <button
                            key={g.id}
                            type="button"
                            onClick={() => onToggle(g.id)}
                            className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-start text-[12.5px] transition hover:bg-muted/60 ${
                                on ? 'bg-pink-500/5' : ''
                            }`}
                        >
                            <span
                                className={`flex size-3.5 shrink-0 items-center justify-center rounded-sm border ${
                                    on ? 'border-pink-500 bg-pink-500' : 'border-muted-foreground/40'
                                }`}
                            >
                                {on ? <span className="text-[9px] leading-none text-white">✓</span> : null}
                            </span>
                            <span className="min-w-0 flex-1 break-all line-clamp-1">
                                {g.full_name || g.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Audience summary ─────────────────────────────────────────────────────── */

/**
 * The recipient count, and — when it is smaller than the guest list — why.
 *
 * ⚠ The "why" matters more here than on any other channel. An email skip is a
 * missing field a host can go and fill in; a push skip means the guest has not
 * installed the app, which no amount of editing the guest list will change.
 * A bare "0 recipients" would read as a broken screen.
 */
function AudienceSummary({
    preview, pushEnabled, hasOwnDevice,
}: {
    preview: AudiencePreview | null;
    pushEnabled: boolean;
    hasOwnDevice: boolean;
}) {
    if (!preview) {
        return <p className="text-[12px] text-muted-foreground">Working out who this reaches…</p>;
    }

    const c = preview.counts;
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums">{preview.total_recipients}</span>
                <span className="text-[12.5px] text-muted-foreground">
                    {preview.total_recipients === 1 ? 'guest will receive this' : 'guests will receive this'}
                </span>
            </div>

            {c ? (
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                    {c.selected_guests} selected
                    {c.excluded_declined ? ` · ${c.excluded_declined} declined` : ''}
                    {c.unreachable ? ` · ${c.unreachable} without the app` : ''}
                </p>
            ) : null}

            {preview.unreachable.count ? (
                <div className="flex gap-2 rounded-md border border-border/60 bg-muted/40 p-2.5">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                        {preview.unreachable.reason}
                    </p>
                </div>
            ) : null}

            {pushEnabled && !hasOwnDevice ? (
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Tip: install the app and sign in on your own phone to receive a copy of what
                    your guests get.
                </p>
            ) : null}
        </div>
    );
}

/* ── Preview ──────────────────────────────────────────────────────────────── */

function NotificationPreview({
    title, body, platform,
}: {
    title: string;
    body: string;
    platform: 'android' | 'ios';
}) {
    return (
        <div className="overflow-hidden rounded-xl bg-gradient-to-b from-indigo-400 via-purple-400 to-orange-300 p-3">
            <div className="mb-3 pt-4 text-center text-white">
                <p className="text-3xl font-light leading-none">9:41</p>
                <p className="mt-1 text-[11px] opacity-90">Monday, 19 May</p>
            </div>

            <div
                className={`flex gap-2.5 bg-white/90 p-2.5 text-neutral-900 backdrop-blur dark:bg-neutral-800/90 dark:text-neutral-100 ${
                    platform === 'ios' ? 'rounded-2xl' : 'rounded-lg'
                }`}
            >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-pink-500/15">
                    <Bell className="size-3.5 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-medium opacity-70">Event Invit</span>
                        <span className="shrink-0 text-[10px] opacity-60">now</span>
                    </div>
                    <p className="mt-0.5 break-words text-[12.5px] font-semibold leading-snug line-clamp-2">
                        {title.trim() || 'Notification title'}
                    </p>
                    <p className="mt-0.5 break-words text-[11.5px] leading-snug opacity-80 line-clamp-3">
                        {body.trim() || 'Your message will appear here.'}
                    </p>
                </div>
            </div>
            <div className="h-8" />
        </div>
    );
}

/* ── Small pieces ─────────────────────────────────────────────────────────── */

function SectionTitle({ n, title, muted }: { n: number; title: string; muted?: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-pink-500/15 text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                {n}
            </span>
            <p className="text-[13px] font-semibold">{title}</p>
            {muted ? <span className="text-[11.5px] text-muted-foreground">({muted})</span> : null}
        </div>
    );
}

function Field({
    label, required, error, hint, note, children,
}: {
    label: string;
    required?: boolean;
    error?: boolean;
    hint?: string;
    note?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
                <Label className="text-[12.5px]">
                    {label}
                    {required ? <span className="ms-0.5 text-destructive">*</span> : null}
                </Label>
                {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
            </div>
            {children}
            {note ? <span className="text-[11px] text-muted-foreground">{note}</span> : null}
            {error ? (
                <span className="text-[11px] text-destructive">Please fill all mandatory fields.</span>
            ) : null}
        </div>
    );
}

function ChoiceRow({
    icon: Icon, label, hint, selected, onSelect,
}: {
    icon: React.ElementType;
    label: string;
    hint: string;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-start transition ${
                selected
                    ? 'border-pink-500/60 bg-pink-500/5'
                    : 'border-border hover:border-foreground/25'
            }`}
        >
            <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-pink-500' : 'border-muted-foreground/40'
                }`}
            >
                {selected ? <span className="size-1.5 rounded-full bg-pink-500" /> : null}
            </span>
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
                <span className="block text-[12.5px] font-medium">{label}</span>
                <span className="block text-[11.5px] leading-snug text-muted-foreground">{hint}</span>
            </span>
        </button>
    );
}

function Pill({
    icon: Icon, label, selected, onSelect,
}: {
    icon?: React.ElementType;
    label: string;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] transition ${
                selected
                    ? 'border-pink-500/60 bg-pink-500/10 text-pink-600 dark:text-pink-400'
                    : 'border-border text-muted-foreground hover:border-foreground/25'
            }`}
        >
            {Icon ? <Icon className="size-3.5" /> : null}
            {label}
        </button>
    );
}

