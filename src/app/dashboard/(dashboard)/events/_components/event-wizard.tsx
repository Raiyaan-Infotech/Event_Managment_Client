"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faArrowRight,
    faCheck,
    faCircleInfo,
    faCalendarDays,
    faClock,
    faDownload,
    faQrcode,
    faLink,
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp as faWhatsappBrand } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useEventOptions } from "@/hooks/use-client-portal";
import {
    useCreateEvent,
    useUpdateEvent,
    useClientEvent,
    type ClientEvent,
} from "@/hooks/use-client-events";
import { EVENT_THEMES, PRIMARY_SWATCHES } from "@/lib/event-themes";
import {
    resolveArtwork,
    templatesForEvent,
    templateBackground,
    isDarkTemplate,
} from "@/lib/event-templates";
import { EventQr } from "@/components/common/event-qr";
import { SignInPrompt } from '@/components/common/sign-in-prompt';

/**
 * The six-step event wizard, used by BOTH routes.
 *
 *   /dashboard/events/create        <EventWizard />
 *   /dashboard/events/[id]/edit     <EventWizard eventId={n} />
 *
 * It lives here rather than in the create route because "Continue Editing" on a
 * draft has to reopen the very same form. Duplicating 800 lines to change a
 * POST into a PUT is how the two drift until a field added to one is missing
 * from the other.
 *
 * ── EDIT MODE ────────────────────────────────────────────────────────────────
 * `eventId` switches three things and nothing else: where the initial values
 * come from, whether step 5 POSTs or PUTs, and the wording. The steps, the
 * validation and the plan gating are shared, which is the point.
 *
 * The prefill runs ONCE, guarded by a ref. Re-running it on every render of the
 * query would overwrite whatever the user had just typed each time TanStack
 * refetched in the background.
 *
 *
 * ALL SIX STEPS ARE REAL. Steps 1 and 3 read the plan-scoped taxonomy and menus
 * from `/client/event-options`; step 5's "Create Event" POSTs to
 * `/client/events` and only advances to step 6 when the server answers.
 *
 * THE QR CODE. The backend issues it inside the same transaction that writes
 * the row, so the create response already carries `qr_token` and step 6 renders
 * the code with no second request. What the image encodes is the ENCRYPTED
 * token itself — a scanner returns an opaque `EVQ1.…` string, and only
 * `POST /client/events/qr/decode` can turn it back into event details.
 *
 * STILL PRESENTATIONAL: the invitation layout in step 5 (its QR is a
 * placeholder, because no event exists to encode until step 5 is submitted) and
 * the share tiles on step 6.
 *
 * PLAN GATING IS ENFORCED TWICE. The dropdowns only offer what the plan allows,
 * and the server re-checks every id on the way in — so a hand-rolled POST
 * cannot buy more than the UI shows.
 */

const STEPS = [
    "Event Basics",
    "Event Details & Time",
    "Event Menus",
    "Design & Theme",
    "Preview Invitation",
    "Event Created",
] as const;

// Themes and swatches live in lib/event-themes.ts because the dashboard cards
// render an event's artwork from the same list. They were two copies before,
// which is how a card and its own preview showed different gradients.

const TIME_ZONES = [
    "(GMT +05:30) India Standard Time",
    "(GMT +04:00) Gulf Standard Time",
    "(GMT +00:00) Greenwich Mean Time",
    "(GMT -05:00) Eastern Standard Time",
];

interface FormState {
    category_id: string;
    type_id: string;
    religion_id: string;
    name: string;
    tagline: string;
    description: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    timezone: string;
    privacy: string;
    status: string;
    theme_id: string;
    primary_color: string;
}

const EMPTY: FormState = {
    category_id: "", type_id: "", religion_id: "",
    name: "", tagline: "", description: "",
    start_date: "", end_date: "", start_time: "", end_time: "",
    timezone: TIME_ZONES[0], privacy: "private", status: "upcoming",
    theme_id: "floral-bliss", primary_color: PRIMARY_SWATCHES[0],
};

export function EventWizard({
    eventId,
    initialThemeId,
}: {
    eventId?: number;
    /**
     * Preselected template, from `/dashboard/events/create?theme=<id>` — what
     * "Use Template" on the Templates screen hands over. Validated against the
     * catalogue rather than trusted: a stale or hand-typed id would otherwise
     * put the wizard in a state where step 4 highlights nothing at all.
     */
    initialThemeId?: string;
}) {
    const isEdit = !!eventId;

    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormState>(() => {
        const picked = EVENT_THEMES.find((t) => t.id === initialThemeId);
        return picked ? { ...EMPTY, theme_id: picked.id, primary_color: picked.accent } : EMPTY;
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [menus, setMenus] = useState<Record<number, boolean>>({});
    /** The saved row. Null until step 5 succeeds; step 6 renders from it. */
    const [created, setCreated] = useState<ClientEvent | null>(null);

    // Edit mode only. `enabled` is false for a create, so this costs nothing.
    const existing = useClientEvent(eventId ?? null);

    // Advancing is the mutation's onDone, not something goNext() does on its
    // own — the step must not move until the server has actually written the
    // row, or a failed save leaves the user looking at a success screen.
    const createEvent = useCreateEvent((event) => {
        setCreated(event);
        setStep(6);
    });
    const updateEvent = useUpdateEvent((event) => {
        setCreated(event);
        setStep(6);
    });
    const saving = createEvent.isPending || updateEvent.isPending;

    /**
     * Prefill from the loaded row, exactly once.
     *
     * Without the ref this re-ran on every background refetch and threw away
     * whatever the user had typed since. `menus` is seeded here too, so an
     * unticked menu stays unticked instead of being re-defaulted to on by the
     * seeding effect further down.
     */
    const prefilled = useRef(false);
    useEffect(() => {
        if (!isEdit || prefilled.current) return;
        const row = existing.data;
        if (!row) return;
        prefilled.current = true;

        setForm({
            category_id: row.event_category_id ? String(row.event_category_id) : "",
            type_id: row.event_type_id ? String(row.event_type_id) : "",
            religion_id: row.religion_id ? String(row.religion_id) : "",
            name: row.name ?? "",
            tagline: row.tagline ?? "",
            description: row.description ?? "",
            start_date: row.start_date ?? "",
            end_date: row.end_date ?? "",
            // The stored value is HH:MM:SS; <input type="time"> wants HH:MM and
            // silently shows nothing at all if handed the seconds.
            start_time: (row.start_time ?? "").slice(0, 5),
            end_time: (row.end_time ?? "").slice(0, 5),
            timezone: row.timezone || TIME_ZONES[0],
            privacy: row.privacy ?? "private",
            status: row.status ?? "upcoming",
            theme_id: row.theme_id || EVENT_THEMES[0].id,
            primary_color: row.primary_color || PRIMARY_SWATCHES[0],
        });

        const picked: Record<number, boolean> = {};
        for (const id of row.menu_ids ?? []) picked[id] = true;
        setMenus(picked);
    }, [isEdit, existing.data]);

    // Functional updater — a picker or async field would otherwise write back a
    // stale snapshot of the whole form.
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key as string] ? { ...prev, [key]: false } : prev));
    };

    const categoryId = form.category_id ? Number(form.category_id) : null;
    const typeId = form.type_id ? Number(form.type_id) : null;
    const religionId = form.religion_id ? Number(form.religion_id) : null;

    // One request. Everything here is already narrowed to the client's plan by
    // the backend, so the wizard cannot offer an option they have not paid for.
    const options = useEventOptions();
    const opts = options.data;

    // Changing a parent invalidates its children — keeping them would submit a
    // combination the backend rejects (a type that isn't in the chosen category).
    // `skipCascade` covers the prefill: setting category and type together on
    // load would otherwise trip these and blank the type and religion that were
    // just restored, leaving an edit form that had silently lost two fields.
    const skipCascade = useRef(isEdit);
    useEffect(() => {
        if (skipCascade.current) return;
        setField("type_id", ""); setField("religion_id", "");
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [form.category_id]);
    useEffect(() => {
        if (skipCascade.current) { skipCascade.current = false; return; }
        setField("religion_id", "");
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [form.type_id]);

    // Default every discovered menu to on, matching the design. Only seeds keys
    // not already set, so a user's toggle survives a refetch.
    const menuRows = useMemo(() => opts?.menus ?? [], [opts]);
    useEffect(() => {
        if (!menuRows.length) return;
        // In edit mode the saved selection IS the answer — defaulting unknown
        // menus to on would silently re-add every menu the client had removed.
        if (isEdit && !prefilled.current) return;
        setMenus((prev) => {
            const next = { ...prev };
            let changed = false;
            for (const m of menuRows) {
                if (next[m.id] === undefined) { next[m.id] = isEdit ? false : true; changed = true; }
            }
            return changed ? next : prev;
        });
    }, [menuRows, isEdit]);

    // Already plan-scoped by the backend; `?? []` only guards the pre-load render.
    const categoryRows = opts?.categories ?? [];

    // A plan with no scope ("all") returns every type and religion, so the
    // cascade still has to narrow by what was picked one level up. A plan that
    // IS scoped has already been narrowed and these filters are no-ops.
    const typeRows = useMemo(
        () => (opts?.types ?? []).filter(
            (t) => !categoryId || !t.event_category_id || t.event_category_id === categoryId
        ),
        [opts, categoryId]
    );
    const religionRows = useMemo(
        () => (opts?.religions ?? []).filter(
            (r) =>
                (!categoryId || !r.event_category_id || r.event_category_id === categoryId) &&
                (!typeId || !r.event_type_id || r.event_type_id === typeId)
        ),
        [opts, categoryId, typeId]
    );

    const selectedCategory = categoryRows.find((c) => String(c.id) === form.category_id);
    const selectedType = typeRows.find((t) => String(t.id) === form.type_id);
    /**
     * The admin-authored templates on offer for THIS event.
     *
     * The backend already narrowed them to the client's plan; this narrows
     * again by the category/type picked in step 1, which is why it is done here
     * rather than server-side — changing the category must not cost a round
     * trip in the middle of the wizard.
     */
    const dbTemplates = useMemo(
        () => templatesForEvent(opts?.templates, { categoryId, typeId, religionId }),
        [opts?.templates, categoryId, typeId, religionId]
    );

    /**
     * Step 4 shows the admin catalogue when there is one, and the built-in list
     * when there is not — a fresh install with no templates authored yet must
     * still be able to create an event, so this falls back rather than showing
     * an empty grid.
     */
    const usingDbTemplates = dbTemplates.length > 0;

    // Either kind of theme_id resolves through here, so step 5's preview never
    // has to know which catalogue the id came from.
    const artwork = resolveArtwork(form.theme_id, opts?.templates);
    const selectedTheme = artwork.kind === "legacy" ? artwork.theme : undefined;

    /**
     * If the selected template stops being on offer — the category changed, or
     * an admin unpublished it — step 4 would highlight nothing and the event
     * would save against a template the client can no longer see. Snap to the
     * first one that IS on offer.
     *
     * Guarded on `usingDbTemplates` so it never fires while the options request
     * is still in flight, which would overwrite a restored edit value with a
     * default before the real list had arrived.
     */
    useEffect(() => {
        if (!usingDbTemplates) return;
        if (dbTemplates.some((t) => t.code === form.theme_id)) return;

        // A `?theme=` deep link may name an ADMIN template, which the initial
        // state could not validate — the catalogue had not loaded yet. Honour it
        // here before falling back, or "Use Template" would silently land on a
        // different design than the one that was clicked.
        const deepLinked =
            !isEdit && initialThemeId
                ? dbTemplates.find((t) => t.code === initialThemeId)
                : undefined;

        setField("theme_id", (deepLinked ?? dbTemplates[0]).code);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usingDbTemplates, dbTemplates, form.theme_id]);

    const validate = (target: number) => {
        const next: Record<string, boolean> = {};
        if (target > 1) {
            if (!form.category_id) next.category_id = true;
            if (!form.type_id) next.type_id = true;
        }
        if (target > 2) {
            if (!form.name.trim()) next.name = true;
            if (!form.start_date) next.start_date = true;
            if (!form.end_date) next.end_date = true;
            if (!form.start_time) next.start_time = true;
            if (!form.end_time) next.end_time = true;
        }
        if (Object.keys(next).length) {
            setErrors(next);
            toast.error("Please fill all mandatory fields.");
            return false;
        }
        return true;
    };

    const goNext = () => {
        if (!validate(step + 1)) return;

        if (step === 5) {
            if (saving) return;
            const payload = {
                event_category_id: Number(form.category_id),
                event_type_id: Number(form.type_id),
                // '' is the "not applicable" option, which the server maps to NULL.
                religion_id: form.religion_id ? Number(form.religion_id) : null,
                name: form.name.trim(),
                tagline: form.tagline.trim() || null,
                description: form.description.trim() || null,
                start_date: form.start_date,
                end_date: form.end_date,
                start_time: form.start_time,
                end_time: form.end_time,
                timezone: form.timezone,
                privacy: form.privacy,
                status: form.status,
                // Only the menus still toggled on, and only ones the plan
                // actually returned — a stale key from a previous plan would be
                // rejected by the server rather than silently dropped.
                menu_ids: menuRows.filter((m) => menus[m.id] ?? true).map((m) => m.id),
                theme_id: form.theme_id,
                primary_color: form.primary_color,
            };

            if (isEdit && eventId) updateEvent.mutate({ id: eventId, data: payload });
            else createEvent.mutate(payload);
            return; // onDone advances to step 6
        }

        setStep((s) => Math.min(STEPS.length, s + 1));
    };

    // Rendering the form before the row arrives would flash an empty wizard and
    // then repopulate it, which reads as the edit having lost everything.
    if (isEdit && existing.isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <Skeleton className="h-8 w-[220px]" />
                <Skeleton className="h-[70px] w-full rounded-md" />
                <Skeleton className="h-[420px] w-full rounded-xl" />
            </div>
        );
    }

    if (isEdit && existing.isError) {
        return (
            <Card className="border border-border shadow-none py-0">
                <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                    <p className="text-[15px] font-semibold text-foreground">Event not found</p>
                    <p className="text-[13px] text-muted-foreground">
                        {existing.error instanceof ApiError && existing.error.isAuthError
                            ? "Your session has ended. Sign in again to carry on."
                            : "It may have been deleted."}
                    </p>
                    {existing.error instanceof ApiError && existing.error.isAuthError && (
                        <SignInPrompt className="mt-2" />
                    )}
                    <Button asChild variant="outline" size="sm" className="mt-2 h-9 text-[12.5px]">
                        <Link href="/dashboard/events">Back to My Events</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                    {isEdit ? "Edit Event" : "Create New Event"}
                </h1>
                <p className="mt-1 text-[13.5px] text-muted-foreground">
                    {isEdit
                        ? "Update your event. Changes are saved on the last step."
                        : "Follow the steps below to create your perfect event."}
                </p>

                {/* Confirms the template came across. Without it the choice made
                    on the Templates screen is invisible until step 4, which reads
                    as the button having done nothing. */}
                {!isEdit && initialThemeId && (
                    EVENT_THEMES.some((t) => t.id === initialThemeId) ||
                    dbTemplates.some((t) => t.code === initialThemeId)
                ) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-primary/5 px-3 py-2">
                        <span className="text-[12px] text-muted-foreground">Starting from</span>
                        <Badge variant="ghost" className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {dbTemplates.find((t) => t.code === initialThemeId)?.name ??
                                EVENT_THEMES.find((t) => t.id === initialThemeId)?.name}
                        </Badge>
                        <Link href="/dashboard/templates" className="text-[11.5px] font-semibold text-primary hover:underline">
                            Change template
                        </Link>
                    </div>
                )}
            </div>

            {/* Stepper */}
            <div className="overflow-x-auto">
                <ol className="flex min-w-[680px] items-start">
                    {STEPS.map((label, i) => {
                        const n = i + 1;
                        const done = n < step;
                        const current = n === step;
                        return (
                            <li key={label} className="relative flex flex-1 flex-col items-center gap-2">
                                {/* Connector sits behind the circle and stops at the
                                    row edges, so it never pokes out past step 1 or 6. */}
                                {i > 0 && (
                                    <span
                                        className={cn(
                                            "absolute left-0 top-[15px] h-[2px] w-1/2 -translate-x-1/2",
                                            done || current ? "bg-primary" : "bg-border"
                                        )}
                                        aria-hidden
                                    />
                                )}
                                {i < STEPS.length - 1 && (
                                    <span
                                        className={cn(
                                            "absolute right-0 top-[15px] h-[2px] w-1/2 translate-x-1/2",
                                            done ? "bg-primary" : "bg-border"
                                        )}
                                        aria-hidden
                                    />
                                )}
                                <span
                                    className={cn(
                                        "relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-[12.5px] font-semibold transition-colors",
                                        done && "border-primary bg-primary text-primary-foreground",
                                        current && "border-primary bg-primary text-primary-foreground",
                                        !done && !current && "border-border bg-card text-muted-foreground"
                                    )}
                                >
                                    {done ? <FontAwesomeIcon icon={faCheck} className="!size-[12px]" /> : n}
                                </span>
                                <span
                                    className={cn(
                                        "px-1 text-center text-[12px] leading-tight",
                                        current ? "font-semibold text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {label}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>

            <Card className="border border-border shadow-none py-0">
                <CardContent className="p-6">
                    <p className="text-[12px] font-medium text-muted-foreground">Step {step}</p>
                    <h2 className="mt-0.5 text-[17px] font-bold text-primary">{STEPS[step - 1]}</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">{SUBTITLES[step - 1]}</p>

                    <div className="mt-6">
                        {/* ── Step 1 — real taxonomy ─────────────────────────── */}
                        {step === 1 && (
                            <div className="grid max-w-xl gap-5">
                                {/* An empty dropdown with no explanation reads as a broken
                                    form. The taxonomy endpoints require a session, and this
                                    panel has no login of its own, so 401 is the likely
                                    failure — say so instead of showing nothing. */}
                                {(options.isError || opts?.reason) && (
                                    <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3">
                                        <p className="text-[12.5px] font-semibold text-foreground">
                                            {options.error instanceof ApiError && options.error.isAuthError
                                                ? "You are not signed in"
                                                : opts?.reason
                                                    ? "No options available"
                                                    : "Could not load your plan"}
                                        </p>
                                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                                            {options.error instanceof ApiError && options.error.isAuthError
                                                ? "Your session has ended. Sign in again to carry on."
                                                : opts?.reason
                                                    ? opts.reason
                                                    : options.error instanceof Error
                                                        ? options.error.message
                                                        : "Unknown error."}
                                        </p>
                                        {options.error instanceof ApiError && options.error.isAuthError && (
                                            <SignInPrompt className="mt-2.5" />
                                        )}
                                    </div>
                                )}

                                <Field label="Event Category" required error={errors.category_id}>
                                    <TaxonomySelect
                                        value={form.category_id}
                                        onChange={(v) => setField("category_id", v)}
                                        loading={options.isLoading}
                                        rows={categoryRows}
                                        placeholder="Select event category"
                                        invalid={errors.category_id}
                                    />
                                </Field>

                                <Field label="Event Type" required error={errors.type_id}>
                                    <TaxonomySelect
                                        value={form.type_id}
                                        onChange={(v) => setField("type_id", v)}
                                        loading={options.isLoading}
                                        rows={typeRows}
                                        disabled={!categoryId}
                                        placeholder={categoryId ? "Select event type" : "Select a category first"}
                                        invalid={errors.type_id}
                                    />
                                </Field>

                                <Field label="Religion (Optional)">
                                    <TaxonomySelect
                                        value={form.religion_id}
                                        onChange={(v) => setField("religion_id", v)}
                                        loading={options.isLoading}
                                        rows={religionRows}
                                        disabled={!typeId}
                                        placeholder={typeId ? "Select religion" : "Select an event type first"}
                                    />
                                    <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                                        Religion is optional. You can skip if not applicable.
                                    </p>
                                </Field>
                            </div>
                        )}

                        {/* ── Step 2 ─────────────────────────────────────────── */}
                        {step === 2 && (
                            <div className="grid max-w-2xl gap-5">
                                <Field label="Event Name" required error={errors.name}>
                                    <Input
                                        value={form.name}
                                        onChange={(e) => setField("name", e.target.value.slice(0, 100))}
                                        placeholder="e.g. Priya & Arjun Wedding"
                                        className={cn("h-11 rounded-md", errors.name && "border-destructive")}
                                    />
                                    <Counter value={form.name.length} max={100} />
                                </Field>

                                <Field label="Tagline (Optional)">
                                    <Input
                                        value={form.tagline}
                                        onChange={(e) => setField("tagline", e.target.value.slice(0, 100))}
                                        placeholder="Together with their families"
                                        className="h-11 rounded-md"
                                    />
                                    <Counter value={form.tagline.length} max={100} />
                                </Field>

                                <Field label="Short Description (Optional)">
                                    <Textarea
                                        value={form.description}
                                        onChange={(e) => setField("description", e.target.value.slice(0, 300))}
                                        placeholder="We are delighted to invite you to celebrate our special day."
                                        className="min-h-[90px] rounded-md"
                                    />
                                    <Counter value={form.description.length} max={300} />
                                </Field>

                                {/* Separator, not a hand-placed 1px div. */}
                                <div className="relative pt-2">
                                    <Separator className="absolute inset-x-0 top-1/2" />
                                    <span className="relative mx-auto block w-fit bg-card px-3 text-[12.5px] font-semibold text-primary">
                                        Date &amp; Time
                                    </span>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field label="Start Date" required error={errors.start_date}>
                                        <IconInput icon={faCalendarDays} type="date" value={form.start_date}
                                            onChange={(v) => setField("start_date", v)} invalid={errors.start_date} />
                                    </Field>
                                    <Field label="End Date" required error={errors.end_date}>
                                        <IconInput icon={faCalendarDays} type="date" value={form.end_date}
                                            onChange={(v) => setField("end_date", v)} invalid={errors.end_date} />
                                    </Field>
                                    <Field label="Start Time" required error={errors.start_time}>
                                        <IconInput icon={faClock} type="time" value={form.start_time}
                                            onChange={(v) => setField("start_time", v)} invalid={errors.start_time} />
                                    </Field>
                                    <Field label="End Time" required error={errors.end_time}>
                                        <IconInput icon={faClock} type="time" value={form.end_time}
                                            onChange={(v) => setField("end_time", v)} invalid={errors.end_time} />
                                    </Field>
                                </div>

                                <Field label="Time Zone">
                                    <Select value={form.timezone} onValueChange={(v) => setField("timezone", v)}>
                                        <SelectTrigger className="h-11 rounded-md"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {TIME_ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field label="Event Privacy">
                                        <Select value={form.privacy} onValueChange={(v) => setField("privacy", v)}>
                                            <SelectTrigger className="h-11 rounded-md"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="private">Private</SelectItem>
                                                <SelectItem value="public">Public</SelectItem>
                                                <SelectItem value="unlisted">Unlisted</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field label="Event Status">
                                        <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                                            <SelectTrigger className="h-11 rounded-md"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3 — real event_menus ──────────────────────── */}
                        {step === 3 && (
                            <div className="max-w-xl">
                                {options.isLoading ? (
                                    <div className="flex flex-col gap-3">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <Skeleton key={i} className="h-11 w-full rounded-md" />
                                        ))}
                                    </div>
                                ) : menuRows.length === 0 ? (
                                    <p className="py-10 text-center text-[13px] text-muted-foreground">
                                        No menus are configured for this event type yet.
                                    </p>
                                ) : (
                                    <ul className="flex flex-col divide-y divide-border">
                                        {menuRows.map((m) => (
                                            <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                                                <span className="min-w-0 text-[13.5px] font-medium text-foreground break-words">
                                                    {m.name}
                                                </span>
                                                <Switch
                                                    checked={menus[m.id] ?? true}
                                                    onCheckedChange={(v) => setMenus((p) => ({ ...p, [m.id]: v }))}
                                                    aria-label={m.name}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* ── Step 4 — presentational ────────────────────────── */}
                        {step === 4 && (
                            <div className="max-w-2xl">
                                <p className="mb-3 text-[12.5px] font-semibold text-foreground">Select Theme</p>

                                {/* The admin catalogue when there is one, the built-in
                                    list when there is not. Never an empty grid: a fresh
                                    install with nothing authored yet must still be able
                                    to create an event. */}
                                {usingDbTemplates ? (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {dbTemplates.map((t) => {
                                            const active = form.theme_id === t.code;
                                            const dark = isDarkTemplate(t);
                                            return (
                                                <button
                                                    key={t.code}
                                                    type="button"
                                                    onClick={() => {
                                                        setField("theme_id", t.code);
                                                        // The template's own accent becomes the
                                                        // starting primary colour, so the card
                                                        // on step 5 does not immediately clash
                                                        // with the design just chosen.
                                                        if (t.secondary_color) {
                                                            setField("primary_color", t.secondary_color);
                                                        }
                                                    }}
                                                    aria-pressed={active}
                                                    className={cn(
                                                        "group rounded-md border-2 p-1.5 text-left transition-colors",
                                                        active ? "border-primary" : "border-border hover:border-primary/40"
                                                    )}
                                                >
                                                    <span
                                                        className="relative block aspect-[4/3] w-full overflow-hidden rounded"
                                                        style={templateBackground(t)}
                                                    >
                                                        {/* The template's own thumbnail when it
                                                            has one, so a photo design does not
                                                            read as a flat colour swatch. */}
                                                        {t.thumbnail && (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={t.thumbnail}
                                                                alt=""
                                                                className="absolute inset-0 h-full w-full object-cover"
                                                            />
                                                        )}
                                                        {t.is_featured ? (
                                                            <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-px text-[8px] font-semibold uppercase tracking-wide text-white">
                                                                Featured
                                                            </span>
                                                        ) : null}
                                                        {active && (
                                                            <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                                                                <FontAwesomeIcon icon={faCheck} className="!size-[9px]" />
                                                            </span>
                                                        )}
                                                        {!t.thumbnail && (
                                                            <span
                                                                className={cn(
                                                                    "absolute inset-x-0 bottom-1 text-center text-[7px] font-semibold uppercase tracking-[0.14em]",
                                                                    dark ? "text-white/70" : "text-black/45"
                                                                )}
                                                            >
                                                                {t.style}
                                                            </span>
                                                        )}
                                                    </span>
                                                    {/* break-words, not truncate: an admin can
                                                        name a template anything, and a clipped
                                                        name is how you pick the wrong one. */}
                                                    <span className="mt-2 block break-words text-center text-[12px] font-medium text-foreground">
                                                        {t.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {EVENT_THEMES.map((t) => {
                                            const active = form.theme_id === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setField("theme_id", t.id)}
                                                    aria-pressed={active}
                                                    className={cn(
                                                        "group rounded-md border-2 p-1.5 text-left transition-colors",
                                                        active ? "border-primary" : "border-border hover:border-primary/40"
                                                    )}
                                                >
                                                    <span className={cn("relative block aspect-[4/3] w-full rounded bg-gradient-to-br", t.swatch)}>
                                                        {active && (
                                                            <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                                                                <FontAwesomeIcon icon={faCheck} className="!size-[9px]" />
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="mt-2 block text-center text-[12px] font-medium text-foreground">
                                                        {t.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Said out loud rather than silently swapping catalogues:
                                    otherwise the grid changing under you on a category
                                    change looks like a bug. */}
                                {opts?.templates && opts.templates.length > 0 && dbTemplates.length === 0 && (
                                    <p className="mt-2 text-[11.5px] text-muted-foreground">
                                        None of your plan&rsquo;s templates match this event category, so the
                                        built-in designs are shown instead.
                                    </p>
                                )}

                                <p className="mb-3 mt-6 text-[12.5px] font-semibold text-foreground">Primary Color</p>
                                <div className="flex flex-wrap items-center gap-3">
                                    {PRIMARY_SWATCHES.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setField("primary_color", c)}
                                            aria-label={`Primary colour ${c}`}
                                            aria-pressed={form.primary_color === c}
                                            style={{ backgroundColor: c }}
                                            className={cn(
                                                "grid h-8 w-8 place-items-center rounded-full ring-offset-2 ring-offset-card transition-shadow",
                                                form.primary_color === c && "ring-2 ring-foreground/40"
                                            )}
                                        >
                                            {form.primary_color === c && (
                                                <FontAwesomeIcon icon={faCheck} className="!size-[11px] text-white" />
                                            )}
                                        </button>
                                    ))}
                                    <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-border">
                                        <span
                                            className="absolute inset-0"
                                            style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }}
                                        />
                                        <input
                                            type="color"
                                            value={form.primary_color}
                                            onChange={(e) => setField("primary_color", e.target.value)}
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                            aria-label="Custom primary colour"
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* ── Step 5 — presentational preview ────────────────── */}
                        {step === 5 && (
                            <div className="flex flex-col items-center gap-4">
                                {/* Resolves either catalogue, so the design chosen on
                                    step 4 survives into the preview whichever kind it
                                    was. Without this an admin template silently fell
                                    back to the default gradient one step later. */}
                                <div
                                    className={cn(
                                        "w-full max-w-[300px] overflow-hidden rounded-md border border-border p-6 text-center shadow-sm",
                                        artwork.kind === "legacy" && "bg-gradient-to-br",
                                        artwork.kind === "legacy" && selectedTheme?.swatch
                                    )}
                                    style={
                                        artwork.kind === "template"
                                            ? templateBackground(artwork.template)
                                            : undefined
                                    }
                                >
                                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-foreground/70">
                                        You&rsquo;re invited to
                                    </p>
                                    <p
                                        className="mt-2 text-[24px] font-bold leading-tight break-words"
                                        style={{ color: form.primary_color }}
                                    >
                                        {form.name || "Your Event Name"}
                                    </p>
                                    {form.tagline && (
                                        <p className="mt-1.5 text-[12px] text-foreground/70 break-words">{form.tagline}</p>
                                    )}
                                    <div className="my-4 flex items-center justify-center gap-3 border-y border-foreground/10 py-3">
                                        <span className="text-[26px] font-bold tabular-nums text-foreground">
                                            {form.start_date ? form.start_date.slice(8, 10) : "--"}
                                        </span>
                                        <span className="text-left text-[11px] font-semibold uppercase leading-tight text-foreground/70">
                                            {form.start_date ? new Date(form.start_date).toLocaleString("en", { month: "short" }) : "---"}
                                            <br />
                                            {form.start_date ? form.start_date.slice(0, 4) : "----"}
                                        </span>
                                    </div>
                                    <p className="text-[11.5px] text-foreground/70">
                                        {form.start_time || "--:--"} &ndash; {form.end_time || "--:--"}
                                    </p>
                                    {/* A placeholder, and correctly so: the QR encodes
                                        the event's encrypted token, and no event
                                        exists to encode until this step is submitted.
                                        The real code appears on step 6. */}
                                    <span className="mx-auto mt-4 grid h-20 w-20 place-items-center rounded bg-foreground/10">
                                        <FontAwesomeIcon icon={faQrcode} className="!size-[34px] text-foreground/50" />
                                    </span>
                                    <p className="mt-2 text-[10px] text-foreground/60">
                                        QR code is generated when you create the event
                                    </p>
                                </div>
                                <Button variant="outline" className="h-10 rounded-md text-[13px] font-medium">
                                    <FontAwesomeIcon icon={faDownload} className="mr-2 !size-[12px]" />
                                    Download Invitation
                                </Button>
                            </div>
                        )}

                        {/* ── Step 6 ─────────────────────────────────────────── */}
                        {step === 6 && (
                            <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
                                <span className="grid h-16 w-16 place-items-center rounded-full bg-success/15">
                                    <FontAwesomeIcon icon={faCheck} className="!size-[26px] text-success" />
                                </span>
                                <div>
                                    <p className="text-[18px] font-bold text-success">
                                        {isEdit ? "Changes saved" : "Congratulations!"}
                                    </p>
                                    <p className="mt-1 text-[13px] text-muted-foreground">
                                        {isEdit
                                            // Worth saying plainly: the token is a snapshot, so
                                            // editing reissues it and any code already printed
                                            // stops matching what is stored.
                                            ? "Your event has been updated. Its QR code was reissued, so please use the new one."
                                            : "Your event is ready. You can now share it with your guests."}
                                    </p>
                                </div>

                                {/* Read from the SAVED row, not from the form. What
                                    the server stored is what matters here, and the two
                                    can differ - times come back normalised, and an
                                    optional field left blank comes back null. */}
                                <div className="w-full rounded-md border border-border p-4 text-left">
                                    <p className="mb-3 text-[13px] font-bold text-foreground">Event Quick Summary</p>
                                    <dl className="flex flex-col gap-2">
                                        <SummaryRow label="Event Name" value={created?.name ?? form.name ?? "—"} />
                                        <SummaryRow
                                            label="Date & Time"
                                            value={
                                                created?.start_date
                                                    ? `${created.start_date} | ${(created.start_time ?? "").slice(0, 5)} – ${(created.end_time ?? "").slice(0, 5)}`
                                                    : "—"
                                            }
                                        />
                                        <SummaryRow label="Event Type" value={created?.eventType?.name ?? selectedType?.name ?? "—"} />
                                        <SummaryRow label="Category" value={created?.category?.name ?? selectedCategory?.name ?? "—"} />
                                        <SummaryRow label="Menus Included" value={String(created?.menu_ids?.length ?? 0)} />
                                        <SummaryRow
                                            label="Status"
                                            value={
                                                <Badge
                                                    variant="ghost"
                                                    className="rounded bg-success/15 px-2 py-0.5 text-[11px] font-semibold capitalize text-success"
                                                >
                                                    {created?.status ?? form.status}
                                                </Badge>
                                            }
                                        />
                                    </dl>
                                </div>

                                {/* The event's QR code. The image encodes the encrypted
                                    token verbatim - a normal scanner reads an opaque
                                    EVQ1 string, and nothing about the event leaks to
                                    whoever scanned it. */}
                                <div id="event-qr" className="w-full rounded-md border border-border p-4">
                                    <p className="mb-1 text-left text-[13px] font-bold text-foreground">Event QR Code</p>
                                    <p className="mb-4 text-left text-[11.5px] text-muted-foreground">
                                        Print this on your invitation. The code carries your event details in
                                        encrypted form &mdash; only this app can read it back.
                                    </p>
                                    <EventQr token={created?.qr_token} eventName={created?.name} size={190} />
                                </div>

                                {/*
                                  Share. Copy Link is real; the other three are not
                                  yet, and are shown disabled rather than as buttons
                                  that do nothing when clicked.

                                  WhatsApp and Email need a PUBLIC invitation page to
                                  send a guest to, and there is no such route — the
                                  only event URL today is inside this portal and
                                  requires the client's own login, so sending it to a
                                  guest would hand them a sign-in screen.
                                */}
                                <div className="w-full">
                                    <p className="mb-3 text-left text-[13px] font-bold text-foreground">Share your event</p>
                                    <div className="grid grid-cols-4 gap-3">
                                        <ShareTile
                                            icon={faWhatsappBrand}
                                            label="WhatsApp"
                                            className="bg-success/15 text-success"
                                            soon
                                        />
                                        <ShareTile
                                            icon={faEnvelope}
                                            label="Email"
                                            className="bg-primary/10 text-primary"
                                            soon
                                        />
                                        <ShareTile
                                            icon={faLink}
                                            label="Copy Link"
                                            className="bg-accent/15 text-accent"
                                            onClick={() => {
                                                if (!created) return;
                                                navigator.clipboard
                                                    .writeText(`${window.location.origin}/dashboard/events/${created.id}`)
                                                    .then(() => toast.success("Event link copied"))
                                                    // Clipboard access is denied outside a secure
                                                    // context; a silent no-op would read as a bug.
                                                    .catch(() => toast.error("Your browser blocked clipboard access."));
                                            }}
                                        />
                                        <ShareTile
                                            icon={faQrcode}
                                            label="QR Code"
                                            className="bg-warning/15 text-warning"
                                            onClick={() => {
                                                document
                                                    .getElementById("event-qr")
                                                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* /dashboard is the events grid. /dashboard/events has
                                    no page of its own and falls through to the
                                    "coming soon" catch-all. */}
                                <Button asChild className="mt-2 h-11 w-full rounded-md text-[13px] font-semibold">
                                    <Link href="/dashboard">Go to My Events</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Nav — hidden on the success step, which has its own action. */}
                    {step < 6 && (
                        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
                            <Button
                                variant="outline"
                                onClick={() => setStep((s) => Math.max(1, s - 1))}
                                disabled={step === 1 || saving}
                                className="h-10 rounded-md text-[13px] font-medium"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 !size-[12px]" />
                                Back
                            </Button>
                            <Button
                                onClick={goNext}
                                disabled={saving}
                                className="h-10 rounded-md px-5 text-[13px] font-semibold"
                            >
                                {saving
                                    ? (isEdit ? "Saving Changes..." : "Creating Event...")
                                    : step === 5
                                        ? (isEdit ? "Save Changes" : "Create Event")
                                        : "Next"}
                                {!saving && (
                                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 !size-[12px]" />
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2.5 rounded-md bg-primary/5 px-4 py-3 text-center">
                <FontAwesomeIcon icon={faCircleInfo} className="!size-[13px] shrink-0 text-primary" />
                <p className="text-[12.5px] text-muted-foreground">
                    You can save your progress at any time and continue later from{" "}
                    <Link href="/dashboard/events" className="font-semibold text-primary hover:underline">
                        My Events
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}

const SUBTITLES_LAST = "Your event has been saved successfully.";

const SUBTITLES = [
    "Select the basic information for your event.",
    "Add your event details and schedule.",
    "Choose the menus to show in your event app.",
    "Choose a theme and customize your design.",
    "Review your invitation before publishing.",
    SUBTITLES_LAST,
];

/* ── small building blocks ──────────────────────────────────────────────── */

function Field({
    label, required, error, children,
}: {
    label: string; required?: boolean; error?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2">
            <Label className="text-[12.5px] font-medium">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && <p className="text-[11.5px] text-destructive">This field is required.</p>}
        </div>
    );
}

function Counter({ value, max }: { value: number; max: number }) {
    return (
        <p className="text-right text-[11px] tabular-nums text-muted-foreground">
            {value}/{max}
        </p>
    );
}

function IconInput({
    icon, type, value, onChange, invalid,
}: {
    icon: typeof faCalendarDays; type: string; value: string;
    onChange: (v: string) => void; invalid?: boolean;
}) {
    return (
        <div className="relative">
            <FontAwesomeIcon
                icon={icon}
                className="pointer-events-none absolute left-3.5 top-1/2 !size-[13px] -translate-y-1/2 text-muted-foreground"
            />
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn("h-11 rounded-md pl-10", invalid && "border-destructive")}
            />
        </div>
    );
}

function TaxonomySelect({
    value, onChange, rows, loading, disabled, placeholder, invalid,
}: {
    value: string;
    onChange: (v: string) => void;
    rows?: { id: number; name: string }[];
    loading?: boolean;
    disabled?: boolean;
    placeholder: string;
    invalid?: boolean;
}) {
    if (loading && !disabled) return <Skeleton className="h-11 w-full rounded-md" />;
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={cn("h-11 rounded-md", invalid && "border-destructive")}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {(rows ?? []).length === 0 ? (
                    <div className="px-3 py-2 text-[12.5px] text-muted-foreground">No options available</div>
                ) : (
                    rows!.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <dt className="text-[12.5px] text-muted-foreground">{label}</dt>
            <dd className="text-right text-[12.5px] font-medium text-foreground break-words">{value}</dd>
        </div>
    );
}

/**
 * One share target.
 *
 * `soon` renders it visibly unavailable instead of as a live button. These were
 * all four plain <button>s with no handler — indistinguishable from working
 * ones until you clicked and nothing happened.
 */
function ShareTile({
    icon, label, className, onClick, soon,
}: {
    icon: typeof faEnvelope;
    label: string;
    className: string;
    onClick?: () => void;
    soon?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={soon}
            title={soon ? "Not available yet" : undefined}
            className={cn(
                "flex flex-col items-center gap-1.5",
                soon ? "cursor-not-allowed opacity-45" : "group"
            )}
        >
            <span
                className={cn(
                    "grid h-11 w-11 place-items-center rounded-md transition-transform",
                    !soon && "group-hover:-translate-y-0.5",
                    className
                )}
            >
                <FontAwesomeIcon icon={icon} className="!size-[16px]" />
            </span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
            {soon && (
                <Badge variant="secondary" className="rounded px-1 py-0 text-[8.5px] font-semibold uppercase">
                    Soon
                </Badge>
            )}
        </button>
    );
}
