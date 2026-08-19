"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import {
    useEventCategoryOptions,
    useEventTypeOptions,
    useReligionOptions,
    useEventMenuOptions,
} from "@/hooks/use-event-taxonomy";

/**
 * Create New Event — six-step wizard.
 *
 * WHAT IS REAL: steps 1 and 3 read the backend. The Category -> Type ->
 * Religion cascade is the actual `event_categories` / `event_types` /
 * `religions` chain, and the menu toggles are real `event_menus` rows.
 *
 * WHAT IS NOT: there is no `events` table or endpoint yet, so nothing is
 * persisted — "Create Event" advances to step 6 without a POST. Themes and the
 * invitation preview are presentational. Each of those is marked inline.
 */

const STEPS = [
    "Event Basics",
    "Event Details & Time",
    "Event Menus",
    "Design & Theme",
    "Preview Invitation",
    "Event Created",
] as const;

const THEMES = [
    { id: "floral-bliss", name: "Floral Bliss", swatch: "from-rose-100 via-pink-50 to-rose-200" },
    { id: "royal-classic", name: "Royal Classic", swatch: "from-slate-900 via-indigo-950 to-black" },
    { id: "traditional", name: "Traditional", swatch: "from-amber-100 via-orange-50 to-amber-200" },
    { id: "elegant-gold", name: "Elegant Gold", swatch: "from-amber-700 via-yellow-800 to-amber-900" },
    { id: "minimal-white", name: "Minimal White", swatch: "from-slate-50 via-white to-slate-100" },
    { id: "vintage", name: "Vintage", swatch: "from-stone-200 via-amber-50 to-stone-300" },
];

const PRIMARY_SWATCHES = ["#E91E63", "#8B5CF6", "#2457D6", "#22C55E", "#F59E0B"];

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

export default function CreateEventPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [menus, setMenus] = useState<Record<number, boolean>>({});

    // Functional updater — a picker or async field would otherwise write back a
    // stale snapshot of the whole form.
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key as string] ? { ...prev, [key]: false } : prev));
    };

    const categoryId = form.category_id ? Number(form.category_id) : null;
    const typeId = form.type_id ? Number(form.type_id) : null;
    const religionId = form.religion_id ? Number(form.religion_id) : null;

    const categories = useEventCategoryOptions();
    const types = useEventTypeOptions(categoryId);
    const religions = useReligionOptions(categoryId, typeId);
    const menuList = useEventMenuOptions({ categoryId, typeId, religionId });

    // Changing a parent invalidates its children — keeping them would submit a
    // combination the backend rejects (a type that isn't in the chosen category).
    useEffect(() => { setField("type_id", ""); setField("religion_id", ""); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [form.category_id]);
    useEffect(() => { setField("religion_id", ""); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [form.type_id]);

    // Default every discovered menu to on, matching the design. Only seeds keys
    // not already set, so a user's toggle survives a refetch.
    const menuRows = useMemo(() => menuList.data?.data ?? [], [menuList.data]);
    useEffect(() => {
        if (!menuRows.length) return;
        setMenus((prev) => {
            const next = { ...prev };
            let changed = false;
            for (const m of menuRows) {
                if (next[m.id] === undefined) { next[m.id] = true; changed = true; }
            }
            return changed ? next : prev;
        });
    }, [menuRows]);

    // `?? []` on every list read: getList already normalises, but a render must
    // never depend on a network response having the shape we expect.
    const categoryRows = categories.data?.data ?? [];
    const typeRows = types.data?.data ?? [];
    const religionRows = religions.data?.data ?? [];

    const selectedCategory = categoryRows.find((c) => String(c.id) === form.category_id);
    const selectedType = typeRows.find((t) => String(t.id) === form.type_id);
    const selectedTheme = THEMES.find((t) => t.id === form.theme_id);

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
            // No events endpoint exists yet — see the header comment. When it
            // does, POST here and only advance on success.
            toast.success("Event created successfully");
        }
        setStep((s) => Math.min(STEPS.length, s + 1));
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">Create New Event</h1>
                <p className="mt-1 text-[13.5px] text-muted-foreground">
                    Follow the steps below to create your perfect event.
                </p>
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

            <Card className="border border-border shadow-none">
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
                                {categories.isError && (
                                    <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3">
                                        <p className="text-[12.5px] font-semibold text-foreground">
                                            {categories.error instanceof ApiError && categories.error.isAuthError
                                                ? "You are not signed in"
                                                : "Could not load event categories"}
                                        </p>
                                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                                            {categories.error instanceof ApiError && categories.error.isAuthError
                                                ? "Event categories need a signed-in session. Sign in, then reopen this page."
                                                : categories.error instanceof Error
                                                    ? categories.error.message
                                                    : "Unknown error."}
                                        </p>
                                    </div>
                                )}

                                <Field label="Event Category" required error={errors.category_id}>
                                    <TaxonomySelect
                                        value={form.category_id}
                                        onChange={(v) => setField("category_id", v)}
                                        loading={categories.isLoading}
                                        rows={categoryRows}
                                        placeholder="Select event category"
                                        invalid={errors.category_id}
                                    />
                                </Field>

                                <Field label="Event Type" required error={errors.type_id}>
                                    <TaxonomySelect
                                        value={form.type_id}
                                        onChange={(v) => setField("type_id", v)}
                                        loading={types.isLoading}
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
                                        loading={religions.isLoading}
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

                                <div className="relative pt-2">
                                    <div className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
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
                                {menuList.isLoading ? (
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
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {THEMES.map((t) => {
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
                                <div
                                    className={cn(
                                        "w-full max-w-[300px] rounded-md border border-border bg-gradient-to-br p-6 text-center shadow-sm",
                                        selectedTheme?.swatch
                                    )}
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
                                    <span className="mx-auto mt-4 grid h-20 w-20 place-items-center rounded bg-foreground/10">
                                        <FontAwesomeIcon icon={faQrcode} className="!size-[34px] text-foreground/50" />
                                    </span>
                                    <p className="mt-2 text-[10px] text-foreground/60">Scan to View Event</p>
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
                                    <p className="text-[18px] font-bold text-success">Congratulations!</p>
                                    <p className="mt-1 text-[13px] text-muted-foreground">
                                        Your event is ready. You can now share it with your guests.
                                    </p>
                                </div>

                                <div className="w-full rounded-md border border-border p-4 text-left">
                                    <p className="mb-3 text-[13px] font-bold text-foreground">Event Quick Summary</p>
                                    <dl className="flex flex-col gap-2">
                                        <SummaryRow label="Event Name" value={form.name || "—"} />
                                        <SummaryRow
                                            label="Date & Time"
                                            value={form.start_date ? `${form.start_date} | ${form.start_time} – ${form.end_time}` : "—"}
                                        />
                                        <SummaryRow label="Event Type" value={selectedType?.name ?? "—"} />
                                        <SummaryRow label="Category" value={selectedCategory?.name ?? "—"} />
                                        <SummaryRow
                                            label="Status"
                                            value={
                                                <span className="rounded bg-success/15 px-2 py-0.5 text-[11px] font-semibold capitalize text-success">
                                                    {form.status}
                                                </span>
                                            }
                                        />
                                    </dl>
                                </div>

                                <div className="w-full">
                                    <p className="mb-3 text-left text-[13px] font-bold text-foreground">Share your event</p>
                                    <div className="grid grid-cols-4 gap-3">
                                        <ShareTile icon={faWhatsappBrand} label="WhatsApp" className="bg-success/15 text-success" />
                                        <ShareTile icon={faEnvelope} label="Email" className="bg-primary/10 text-primary" />
                                        <ShareTile icon={faLink} label="Copy Link" className="bg-accent/15 text-accent" />
                                        <ShareTile icon={faQrcode} label="QR Code" className="bg-warning/15 text-warning" />
                                    </div>
                                </div>

                                <Button asChild className="mt-2 h-11 w-full rounded-md text-[13px] font-semibold">
                                    <Link href="/dashboard/events">Go to My Events</Link>
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
                                disabled={step === 1}
                                className="h-10 rounded-md text-[13px] font-medium"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 !size-[12px]" />
                                Back
                            </Button>
                            <Button onClick={goNext} className="h-10 rounded-md px-5 text-[13px] font-semibold">
                                {step === 5 ? "Create Event" : "Next"}
                                <FontAwesomeIcon icon={faArrowRight} className="ml-2 !size-[12px]" />
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

const SUBTITLES = [
    "Select the basic information for your event.",
    "Add your event details and schedule.",
    "Choose the menus to show in your event app.",
    "Choose a theme and customize your design.",
    "Review your invitation before publishing.",
    "Your event has been created successfully.",
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

function ShareTile({
    icon, label, className,
}: {
    icon: typeof faEnvelope; label: string; className: string;
}) {
    return (
        <button type="button" className="flex flex-col items-center gap-1.5">
            <span className={cn("grid h-11 w-11 place-items-center rounded-md transition-transform hover:-translate-y-0.5", className)}>
                <FontAwesomeIcon icon={icon} className="!size-[16px]" />
            </span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
        </button>
    );
}
