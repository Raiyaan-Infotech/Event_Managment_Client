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
    faQrcode,
    faLink,
    faEnvelope,
    faPalette,
    faGripVertical,
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
import { useEventOptions, type MenuOption } from "@/hooks/use-client-portal";
import {
    useCreateEvent,
    useUpdateEvent,
    useClientEvent,
    type ClientEvent,
} from "@/hooks/use-client-events";
import { PRIMARY_SWATCHES } from "@/lib/event-themes";
import {
    resolveArtwork,
    templatesForEvent,
    templateBackground,
    isDarkTemplate,
} from "@/lib/event-templates";
import { downloadNodeAsImage, downloadQrAsPng, fileSlug } from "@/lib/export-invitation";
import { EventQr } from "@/components/common/event-qr";
import { InvitationCard } from "@/components/common/invitation-card";
import { DownloadMenu, type DownloadKind } from "@/components/common/invitation-download";
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

const MENU_GROUP_LABELS: Record<MenuOption["menu_group"], string> = {
    core: "Core Menus",
    additional: "Additional Menus",
    custom: "Custom Menus",
};

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
    host_one: string;
    host_two: string;
    tagline: string;
    description: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    timezone: string;
    venue_name: string;
    venue_address: string;
    organizer: string;
    contact_phone: string;
    contact_email: string;
    footer_note: string;
    privacy: string;
    status: string;
    theme_id: string;
    primary_color: string;
}

const EMPTY: FormState = {
    category_id: "", type_id: "", religion_id: "",
    name: "", host_one: "", host_two: "", tagline: "", description: "",
    start_date: "", end_date: "", start_time: "", end_time: "",
    timezone: TIME_ZONES[0],
    venue_name: "", venue_address: "",
    organizer: "", contact_phone: "", contact_email: "", footer_note: "",
    privacy: "private", status: "upcoming",
    // Blank, not a hardcoded slug: the theme catalogue is whatever the client's
    // PLAN grants, so nothing can be preselected until those templates load.
    theme_id: "", primary_color: PRIMARY_SWATCHES[0],
};

/** The invitation components, canonical order. Mirrors the backend's list. */
const COMPONENT_KEYS = [
    "event_title", "host_names", "date_time", "venue", "event_qr_code", "organizer",
    "event_photos", "contact_details", "invitation_message", "social_icons",
    "footer_note", "decoration_elements",
] as const;

type ComponentKey = (typeof COMPONENT_KEYS)[number];


const COMPONENT_LABELS: Record<ComponentKey, string> = {
    event_title: "Event Title",
    host_names: "Host / Couple Names",
    date_time: "Date & Time",
    venue: "Venue",
    event_qr_code: "Event QR Code",
    organizer: "Organizer / Hosted By",
    event_photos: "Event Photos",
    contact_details: "Contact Details",
    invitation_message: "Invitation Message",
    social_icons: "Social Media Icons",
    footer_note: "Footer (Thanks / Note)",
    decoration_elements: "Decoration Elements",
};

export function EventWizard({
    eventId,
    initialThemeId,
}: {
    eventId?: number;
    /**
     * Preselected template code, from `/dashboard/events/create?theme=<code>` —
     * what "Use Template" on the Templates screen hands over. It cannot be
     * validated here (the plan's templates have not loaded yet), so it is held
     * as-is and checked against the real catalogue by the effect below.
     */
    initialThemeId?: string;
}) {
    const isEdit = !!eventId;

    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [menus, setMenus] = useState<Record<number, boolean>>({});

    /**
     * The client's own component overrides for THIS event.
     *
     * Null means "inherit from the template" — the state the wizard starts in
     * and the state Reset returns to. Only once the client actually touches a
     * toggle or drags a chip do these become a real override that is sent, so
     * an untouched event keeps following the template as the admin edits it.
     */
    const [compOverride, setCompOverride] = useState<Record<ComponentKey, boolean> | null>(null);
    const [orderOverride, setOrderOverride] = useState<ComponentKey[] | null>(null);
    const [dragKey, setDragKey] = useState<ComponentKey | null>(null);

    /**
     * Download.
     *
     * `previewWrapRef` wraps step 5's preview and `qrWrapRef` step 6's code; the
     * capture targets `[data-invitation-card]` INSIDE the wrapper rather than
     * the wrapper itself, so the caption and the button around it are not part
     * of the image. Same marker the admin panel's export uses.
     */
    const previewWrapRef = useRef<HTMLDivElement>(null);
    const qrWrapRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState<DownloadKind | null>(null);
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
            host_one: row.host_one ?? "",
            host_two: row.host_two ?? "",
            tagline: row.tagline ?? "",
            description: row.description ?? "",
            start_date: row.start_date ?? "",
            end_date: row.end_date ?? "",
            // The stored value is HH:MM:SS; <input type="time"> wants HH:MM and
            // silently shows nothing at all if handed the seconds.
            start_time: (row.start_time ?? "").slice(0, 5),
            end_time: (row.end_time ?? "").slice(0, 5),
            timezone: row.timezone || TIME_ZONES[0],
            venue_name: row.venue_name ?? "",
            venue_address: row.venue_address ?? "",
            organizer: row.organizer ?? "",
            contact_phone: row.contact_phone ?? "",
            contact_email: row.contact_email ?? "",
            footer_note: row.footer_note ?? "",
            privacy: row.privacy ?? "private",
            status: row.status ?? "upcoming",
            theme_id: row.theme_id || "",
            primary_color: row.primary_color || PRIMARY_SWATCHES[0],
        });

        const picked: Record<number, boolean> = {};
        for (const id of row.menu_ids ?? []) picked[id] = true;
        setMenus(picked);

        // Restore an override only if the row HAS one. A null stays null, so
        // an event that was following its template carries on following it.
        if (row.components) {
            setCompOverride(
                Object.fromEntries(
                    COMPONENT_KEYS.map((k) => [k, !!Number(row.components?.[k] ?? 1)])
                ) as Record<ComponentKey, boolean>
            );
        }
        if (row.component_order?.length) {
            const given = row.component_order.filter(
                (k): k is ComponentKey => (COMPONENT_KEYS as readonly string[]).includes(k)
            );
            setOrderOverride([...given, ...COMPONENT_KEYS.filter((k) => !given.includes(k))]);
        }
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

    /**
     * The menus on offer for THIS event.
     *
     * Exactly what the plan grants via `subscription_plan_menus` — that join is
     * a manual admin assignment ("this plan includes these menus"), NOT a claim
     * that the menu's own `event_category_id`/`event_type_id`/`religion_id`
     * matches what was picked in step 1. Those columns are the menu's own
     * general catalogue tag (Menu Management), unrelated to plan curation, and
     * an admin can and does attach a menu tagged for one category to a plan
     * scoped to another — re-filtering here would silently hide menus the
     * admin explicitly chose to include.
     */
    const menuRows = useMemo(() => opts?.menus ?? [], [opts]);

    /** Core / Additional / Custom sections, in that fixed order, empty groups dropped. */
    const menuGroups = useMemo(() => {
        const order: MenuOption["menu_group"][] = ["core", "additional", "custom"];
        return order
            .map((group) => ({ group, rows: menuRows.filter((m) => m.menu_group === group) }))
            .filter((g) => g.rows.length > 0);
    }, [menuRows]);
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
     * Step 5's preview artwork.
     *
     * `resolveArtwork` still falls back to the built-in catalogue, and must:
     * an event SAVED before this feature holds a legacy slug in `theme_id`, and
     * reopening it for edit has to show the design it actually has rather than
     * a blank card. What changed is that step 4 no longer OFFERS those — the
     * fallback is for rendering history, not for picking something new.
     */
    const artwork = resolveArtwork(form.theme_id, opts?.templates);
    const selectedTheme = artwork.kind === "legacy" ? artwork.theme : undefined;

    /**
     * What the template says, before any override — the baseline the toggles
     * start from and the thing "Reset to template" returns to.
     */
    const templateComponents = useMemo(() => {
        const map = {} as Record<ComponentKey, boolean>;
        for (const key of COMPONENT_KEYS) {
            const v = artwork.kind === "template" ? artwork.template.components?.[key] : undefined;
            // Absent means on, matching every other renderer.
            map[key] = v === undefined || !!Number(v);
        }
        return map;
    }, [artwork]);

    const templateOrder = useMemo(() => {
        const given = (artwork.kind === "template" ? artwork.template.component_order ?? [] : [])
            .filter((k): k is ComponentKey => (COMPONENT_KEYS as readonly string[]).includes(k));
        return [...given, ...COMPONENT_KEYS.filter((k) => !given.includes(k))];
    }, [artwork]);

    // The override when the client has made one, the template otherwise.
    const effectiveComponents = compOverride ?? templateComponents;
    const effectiveOrder = orderOverride ?? templateOrder;
    const hasOverride = compOverride !== null || orderOverride !== null;

    /** Switching one component starts an override from the template's baseline. */
    const toggleComponent = (key: ComponentKey, value: boolean) => {
        setCompOverride((prev) => ({ ...(prev ?? templateComponents), [key]: value }));
    };

    /** Drop `dragKey` in front of `target`, seeding from the template's order. */
    const moveComponent = (target: ComponentKey) => {
        if (!dragKey || dragKey === target) return;
        const base = [...(orderOverride ?? templateOrder)];
        const from = base.indexOf(dragKey);
        const to = base.indexOf(target);
        if (from < 0 || to < 0) return;
        base.splice(from, 1);
        base.splice(to, 0, dragKey);
        setOrderOverride(base);
    };

    const resetComponents = () => {
        setCompOverride(null);
        setOrderOverride(null);
    };

    /**
     * Capture the invitation card, or the QR, and hand the file to the browser.
     *
     * The event may not be saved yet on step 5, so the filename falls back to
     * whatever has been typed — a file called "invitation.png" tells whoever
     * opens the downloads folder nothing.
     */
    const downloadInvitation = async (kind: DownloadKind) => {
        if (downloading) return;
        const baseName = fileSlug(created?.name ?? form.name, "invitation");

        setDownloading(kind);
        try {
            if (kind === "qr") {
                const wrap = qrWrapRef.current;
                if (!wrap) throw new Error("The QR code is not ready yet.");
                await downloadQrAsPng(wrap, baseName);
            } else {
                const card = (step === 6 ? qrWrapRef : previewWrapRef).current
                    ?.querySelector<HTMLElement>("[data-invitation-card]")
                    // Step 6 has no card of its own, so fall back to the one
                    // step 5 rendered — it is still mounted in the same tree.
                    ?? previewWrapRef.current?.querySelector<HTMLElement>("[data-invitation-card]");
                if (!card) throw new Error("There is no invitation to download yet.");
                await downloadNodeAsImage(card, baseName, kind);
            }
            toast.success("Invitation downloaded.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Could not download the invitation."
            );
        } finally {
            setDownloading(null);
        }
    };

    /**
     * If the selected template stops being on offer — the category changed, or
     * an admin unpublished it — step 4 would highlight nothing and the event
     * would save against a template the client can no longer see. Snap to the
     * first one that IS on offer.
     *
     * Guarded on a non-empty list so it never fires while the options request
     * is still in flight, which would overwrite a restored edit value with a
     * default before the real list had arrived.
     */
    useEffect(() => {
        if (dbTemplates.length === 0) return;
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
    }, [dbTemplates, form.theme_id]);

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

        /**
         * Format checks, reported separately from the mandatory-field toast.
         *
         * Both are OPTIONAL fields, so an empty one is fine — this only fires on
         * something that was typed and is malformed. The server rejects the same
         * two, and catching it here saves a round trip that would land the user
         * back on a step they had already left.
         */
        if (target > 2) {
            const phone = form.contact_phone.trim();
            const email = form.contact_email.trim();
            if (phone && !/^[\d\s+()-]{6,30}$/.test(phone)) {
                setErrors({ contact_phone: true });
                toast.error("Please enter a valid contact number.");
                return false;
            }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setErrors({ contact_email: true });
                toast.error("Please enter a valid contact email address.");
                return false;
            }
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
                host_one: form.host_one.trim() || null,
                host_two: form.host_two.trim() || null,
                tagline: form.tagline.trim() || null,
                description: form.description.trim() || null,
                start_date: form.start_date,
                end_date: form.end_date,
                start_time: form.start_time,
                end_time: form.end_time,
                timezone: form.timezone,
                venue_name: form.venue_name.trim() || null,
                venue_address: form.venue_address.trim() || null,
                organizer: form.organizer.trim() || null,
                contact_phone: form.contact_phone.trim() || null,
                contact_email: form.contact_email.trim() || null,
                footer_note: form.footer_note.trim() || null,
                privacy: form.privacy,
                status: form.status,
                // Only the menus still toggled on, and only ones the plan
                // actually returned — a stale key from a previous plan would be
                // rejected by the server rather than silently dropped.
                menu_ids: menuRows.filter((m) => menus[m.id] ?? true).map((m) => m.id),
                theme_id: form.theme_id,
                primary_color: form.primary_color,
                // null means "keep following the template". Sent explicitly so
                // that clearing an override actually clears it server-side
                // rather than leaving the old one in place.
                components: compOverride
                    ? Object.fromEntries(COMPONENT_KEYS.map((k) => [k, compOverride[k] ? 1 : 0]))
                    : null,
                component_order: orderOverride,
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
                {!isEdit && initialThemeId && dbTemplates.some((t) => t.code === initialThemeId) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-primary/5 px-3 py-2">
                        <span className="text-[12px] text-muted-foreground">Starting from</span>
                        <Badge variant="ghost" className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {dbTemplates.find((t) => t.code === initialThemeId)?.name}
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
                            // Full card width, not capped: three selects in a row
                            // need the room, and any max-w leaves a dead gutter
                            // down the right of a wide card.
                            <div className="grid gap-5">
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

                                {/* One row on desktop — the three are a single
                                    cascading choice, and stacking them made a
                                    short step look longer than it is. They still
                                    stack on narrow screens, where three selects
                                    side by side would be unusable. */}
                                <div className="grid gap-5 md:grid-cols-3">
                                    <Field label="Event Category" required error={errors.category_id}>
                                        <TaxonomySelect
                                            value={form.category_id}
                                            onChange={(v) => setField("category_id", v)}
                                            loading={options.isLoading}
                                            rows={categoryRows}
                                            placeholder="Select category"
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
                                            placeholder={categoryId ? "Select type" : "Category first"}
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
                                            placeholder={typeId ? "Select religion" : "Type first"}
                                        />
                                    </Field>
                                </div>

                                <p className="text-[11.5px] text-muted-foreground">
                                    Religion is optional. You can skip if not applicable.
                                </p>
                            </div>
                        )}

                        {/* ── Step 2 ─────────────────────────────────────────── */}
                        {step === 2 && (
                            /*
                              Two PANELS side by side, not two columns of fields.

                              The step asks for two different kinds of thing: what
                              the event IS (its name, hosts, when it happens) and
                              what the INVITATION says (venue, organiser, contact,
                              footer). Interleaving them across a plain two-column
                              grid put unrelated fields next to each other and made
                              the section rules meaningless — a heading spanning
                              both columns still had the previous section's fields
                              beside it.

                              Each panel is a vertical stack, so reading down one
                              column follows one subject. Pairs that genuinely
                              belong together (start/end date, phone/email) nest as
                              a two-column row INSIDE a panel.

                              Stacks below `lg`, where two panels would leave each
                              field about 300px wide.
                            */
                            <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">

                                {/* ── Panel 1 — the event itself ─────────────── */}
                                <div className="flex min-w-0 flex-col gap-5">
                                    <PanelHeading label="Event Details" />

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

                                    {/* Two fields, because the invitation prints them
                                        on their own lines either side of an ampersand.
                                        One "A & B" field would have to be split back
                                        apart on a separator a single name can contain. */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="First Host Name (Optional)">
                                            <Input
                                                value={form.host_one}
                                                onChange={(e) => setField("host_one", e.target.value.slice(0, 120))}
                                                placeholder="e.g. Priya"
                                                className="h-11 rounded-md"
                                            />
                                        </Field>
                                        <Field label="Second Host Name (Optional)">
                                            <Input
                                                value={form.host_two}
                                                onChange={(e) => setField("host_two", e.target.value.slice(0, 120))}
                                                placeholder="e.g. Arjun"
                                                className="h-11 rounded-md"
                                            />
                                        </Field>
                                    </div>

                                    <Field label="Short Description (Optional)">
                                        <Textarea
                                            value={form.description}
                                            onChange={(e) => setField("description", e.target.value.slice(0, 300))}
                                            placeholder="We are delighted to invite you to celebrate our special day."
                                            className="min-h-[90px] rounded-md"
                                        />
                                        <Counter value={form.description.length} max={300} />
                                    </Field>

                                    <SectionRule label="Date & Time" />

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
                                            <SelectTrigger className="h-11 w-full rounded-md"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {TIME_ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>

                                {/* ── Panel 2 — what the invitation says ─────── */}
                                <div className="flex min-w-0 flex-col gap-5">
                                    <PanelHeading label="Invitation Details" />

                                    {/* The venue columns and the API have accepted
                                        these all along — only the form was missing,
                                        so every invitation printed "Venue to be
                                        confirmed" with no way for anyone to fix it. */}
                                    <Field label="Venue Name">
                                        <Input
                                            value={form.venue_name}
                                            onChange={(e) => setField("venue_name", e.target.value.slice(0, 255))}
                                            placeholder="e.g. The Grand Palace"
                                            className="h-11 rounded-md"
                                        />
                                    </Field>

                                    <Field label="Venue Address">
                                        <Textarea
                                            value={form.venue_address}
                                            onChange={(e) => setField("venue_address", e.target.value.slice(0, 500))}
                                            placeholder="Street, area, city and postcode"
                                            className="min-h-[90px] rounded-md"
                                        />
                                        <Counter value={form.venue_address.length} max={500} />
                                    </Field>

                                    {/* Each of these backs a component the template
                                        can switch on. Left blank, the invitation
                                        falls back to a placeholder — which is what
                                        every event showed before these existed. */}
                                    <Field label="Organizer / Hosted By">
                                        <Input
                                            value={form.organizer}
                                            onChange={(e) => setField("organizer", e.target.value.slice(0, 200))}
                                            placeholder="e.g. Hosted by the Verma family"
                                            className="h-11 rounded-md"
                                        />
                                    </Field>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="Contact Number" error={errors.contact_phone}>
                                            <Input
                                                value={form.contact_phone}
                                                onChange={(e) => setField("contact_phone", e.target.value.slice(0, 30))}
                                                placeholder="+91 98765 43210"
                                                inputMode="tel"
                                                className={cn("h-11 rounded-md", errors.contact_phone && "border-destructive")}
                                            />
                                        </Field>
                                        <Field label="Contact Email" error={errors.contact_email}>
                                            <Input
                                                value={form.contact_email}
                                                onChange={(e) => setField("contact_email", e.target.value.slice(0, 150))}
                                                placeholder="hello@example.com"
                                                inputMode="email"
                                                className={cn("h-11 rounded-md", errors.contact_email && "border-destructive")}
                                            />
                                        </Field>
                                    </div>

                                    <Field label="Footer Note">
                                        <Input
                                            value={form.footer_note}
                                            onChange={(e) => setField("footer_note", e.target.value.slice(0, 300))}
                                            placeholder="e.g. Thank you for being part of our story."
                                            className="h-11 rounded-md"
                                        />
                                        <Counter value={form.footer_note.length} max={300} />
                                    </Field>

                                    <SectionRule label="Visibility" />

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="Event Privacy">
                                            <Select value={form.privacy} onValueChange={(v) => setField("privacy", v)}>
                                                <SelectTrigger className="h-11 w-full rounded-md"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="private">Private</SelectItem>
                                                    <SelectItem value="public">Public</SelectItem>
                                                    <SelectItem value="unlisted">Unlisted</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field label="Event Status">
                                            <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                                                <SelectTrigger className="h-11 w-full rounded-md"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>
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
                                    <div className="flex flex-col gap-6">
                                        {menuGroups.map(({ group, rows }) => (
                                            <div key={group}>
                                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                                    {MENU_GROUP_LABELS[group]}
                                                </p>
                                                <ul className="flex flex-col divide-y divide-border">
                                                    {rows.map((m) => (
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
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Step 4 — presentational ────────────────────────── */}
                        {step === 4 && (
                            /*
                              Two panels, matching step 2: the DESIGN on the left,
                              what the invitation CARRIES on the right. They are
                              different decisions — picking artwork versus choosing
                              which blocks appear — and stacking them made step 4 a
                              long scroll where the component toggles were far
                              enough below the theme grid to look unrelated to it.

                              Stacks below `xl`: the theme grid is itself 2-3
                              columns of cards, so two panels need real width.
                            */
                            <div className="grid gap-x-10 gap-y-8 xl:grid-cols-2">
                                <div className="flex min-w-0 flex-col gap-3">
                                    <PanelHeading label="Theme & Colour" />
                                    <p className="text-[12px] text-muted-foreground">
                                        Pick the invitation design. Your plan decides what is on offer.
                                    </p>

                                {/* ONLY the admin catalogue, narrowed to this client's
                                    plan and to the category/type/religion picked in
                                    step 1. There is deliberately no built-in fallback:
                                    offering designs the plan does not grant is exactly
                                    the mis-sell the plan gating exists to prevent, and
                                    a hardcoded grid made an empty catalogue look full. */}
                                {options.isLoading ? (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <Skeleton key={i} className="aspect-[4/3] w-full rounded-md" />
                                        ))}
                                    </div>
                                ) : dbTemplates.length > 0 ? (
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
                                    /* An empty catalogue is stated, not papered over with
                                       stand-in designs. The two cases have different
                                       answers — narrow the event, or ask for more — so
                                       they are worded differently rather than merged. */
                                    <div className="rounded-md border border-dashed border-border px-6 py-10 text-center">
                                        <FontAwesomeIcon icon={faPalette} className="!size-[24px] text-muted-foreground/40" />
                                        <p className="mt-3 text-[13.5px] font-semibold text-foreground">
                                            No templates available
                                        </p>
                                        <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-muted-foreground">
                                            {opts?.templates && opts.templates.length > 0
                                                ? "None of your plan’s templates match the category, type or religion selected in Event Basics. Go back and change your selection, or contact us for more designs."
                                                : "Your subscription plan doesn’t include any invitation templates yet. Please contact us to have them added to your plan."}
                                        </p>
                                        <p className="mt-3 text-[11.5px] text-muted-foreground/80">
                                            You can still continue — a template can be chosen later by editing the event.
                                        </p>
                                    </div>
                                )}

                                    {/* What this colour ACTUALLY drives: the
                                        event / host names on the invitation and on
                                        every thumbnail of it. Nothing else reads it —
                                        the card's background, frame and accents all
                                        come from the template. It is held to a 4.5:1
                                        contrast floor at render time, because it is
                                        picked from a swatch row that knows nothing
                                        about the design behind it. */}
                                    <p className="mb-1 mt-6 text-[12.5px] font-semibold text-foreground">Primary Colour</p>
                                    <p className="mb-3 text-[12px] text-muted-foreground">
                                        Used for the names printed on your invitation.
                                    </p>
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

                                {/* ── Per-event component control ───────────────
                                    The template sets the defaults; this is the
                                    client's override for THIS event only. It
                                    stays null until something is actually
                                    touched, so an untouched event keeps
                                    following the template as the admin edits it
                                    — copying the map up front would freeze the
                                    design at creation time.

                                    The whole PANEL is conditional, heading and
                                    all: with no admin template there is nothing
                                    to override, and a heading standing over an
                                    empty column reads as a section that failed
                                    to load. */}
                                {artwork.kind === "template" && (
                                    <div className="flex min-w-0 flex-col gap-3">
                                        <PanelHeading label="Invitation Components" />

                                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-[12px] text-muted-foreground">
                                                    {hasOverride
                                                        ? "Customised for this event."
                                                        : `Following the ${artwork.template.name} template.`}
                                                </p>
                                            </div>
                                            {hasOverride && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetComponents}
                                                    className="h-8 rounded-md text-[12px]"
                                                >
                                                    Reset to template
                                                </Button>
                                            )}
                                        </div>

                                        <ul className="grid gap-x-6 sm:grid-cols-2">
                                            {COMPONENT_KEYS.map((key) => (
                                                <li
                                                    key={key}
                                                    className="flex items-center justify-between gap-3 border-b border-border py-2.5"
                                                >
                                                    <span className="min-w-0 text-[12.5px] text-foreground break-words">
                                                        {COMPONENT_LABELS[key]}
                                                    </span>
                                                    <Switch
                                                        checked={effectiveComponents[key]}
                                                        onCheckedChange={(v) => toggleComponent(key, v)}
                                                        aria-label={COMPONENT_LABELS[key]}
                                                    />
                                                </li>
                                            ))}
                                        </ul>

                                        <p className="mb-2 mt-6 text-[12.5px] font-semibold text-foreground">
                                            Component Order
                                        </p>
                                        <p className="mb-3 text-[11.5px] text-muted-foreground">
                                            Drag the chips to arrange the order components appear on the
                                            invitation. Components switched off keep their place.
                                        </p>
                                        <ul className="flex flex-wrap gap-2">
                                            {effectiveOrder.map((key, index) => (
                                                <li
                                                    key={key}
                                                    draggable
                                                    onDragStart={() => setDragKey(key)}
                                                    onDragEnd={() => setDragKey(null)}
                                                    // Both are required: without preventDefault on
                                                    // dragOver the browser refuses the drop outright.
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        moveComponent(key);
                                                        setDragKey(null);
                                                    }}
                                                    className={cn(
                                                        "flex cursor-grab items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11.5px] transition-colors active:cursor-grabbing",
                                                        dragKey === key
                                                            ? "border-primary bg-primary/10"
                                                            : "border-border bg-card",
                                                        // Struck through rather than hidden: an off
                                                        // component keeps its place in the order, and
                                                        // dropping it from the list would make turning
                                                        // it back on land it somewhere unexpected.
                                                        !effectiveComponents[key] && "opacity-50"
                                                    )}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faGripVertical}
                                                        className="!size-[10px] text-muted-foreground"
                                                    />
                                                    <span className="grid h-4 w-4 place-items-center rounded bg-foreground/80 text-[9px] font-semibold text-background">
                                                        {index + 1}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "break-words",
                                                            !effectiveComponents[key] && "line-through"
                                                        )}
                                                    >
                                                        {COMPONENT_LABELS[key]}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Step 5 — presentational preview ────────────────── */}
                        {step === 5 && (
                            <div ref={previewWrapRef} className="flex flex-col items-center gap-4">
                                {/*
                                  The real invitation, not a summary of it.

                                  This was a hand-rolled card that drew a
                                  background, the name, the date and nothing
                                  else — so the same template that renders a
                                  framed, decorated invitation in the admin
                                  panel showed the client an almost empty
                                  swatch, one step before they approve it.

                                  InvitationCard applies the template properly:
                                  frame artwork, decorations, the components the
                                  design enables, in its own component_order —
                                  filled with what was typed on steps 1-4.
                                */}
                                {artwork.kind === "template" ? (
                                    <InvitationCard
                                        template={artwork.template}
                                        // Whatever step 4 was left showing — so the
                                        // preview and the toggles cannot disagree.
                                        componentsOverride={
                                            compOverride
                                                ? Object.fromEntries(
                                                    COMPONENT_KEYS.map((k) => [k, compOverride[k] ? 1 : 0])
                                                )
                                                : null
                                        }
                                        orderOverride={orderOverride}
                                        data={{
                                            name: form.name,
                                            hostOne: form.host_one,
                                            hostTwo: form.host_two,
                                            tagline: form.tagline,
                                            description: form.description,
                                            startDate: form.start_date,
                                            startTime: form.start_time,
                                            endTime: form.end_time,
                                            venueName: form.venue_name,
                                            venueAddress: form.venue_address,
                                            organizer: form.organizer,
                                            contact: form.contact_phone,
                                            footerNote: form.footer_note,
                                            primaryColor: form.primary_color,
                                        }}
                                    />
                                ) : (
                                    /* A legacy theme has no template row to render
                                       from — only a gradient — so the older card
                                       stays for events created before the admin
                                       catalogue existed. */
                                    <div
                                        className={cn(
                                            "w-full max-w-[248px] overflow-hidden rounded-md border border-border p-6 text-center shadow-sm bg-gradient-to-br",
                                            selectedTheme?.swatch
                                        )}
                                    >
                                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-foreground/70">
                                            You&rsquo;re invited to
                                        </p>
                                        <p
                                            className="mt-2 text-[22px] font-bold leading-tight break-words"
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
                                                {form.start_date ? form.start_date.slice(5, 7) : "--"}
                                                <br />
                                                {form.start_date ? form.start_date.slice(0, 4) : "----"}
                                            </span>
                                        </div>
                                        <p className="text-[11.5px] text-foreground/70">
                                            {form.start_time || "--:--"} &ndash; {form.end_time || "--:--"}
                                        </p>
                                    </div>
                                )}

                                <p className="text-center text-[11px] text-muted-foreground">
                                    The QR code is generated when you create the event.
                                </p>

                                {/* The QR is not offered here: no event exists yet,
                                    so there is no token to encode. It appears on
                                    step 6, once the row has been written. */}
                                <DownloadMenu
                                    busy={downloading}
                                    onPick={(format) => downloadInvitation(format)}
                                />
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
                                <div ref={qrWrapRef} id="event-qr" className="w-full rounded-md border border-border p-4">
                                    <p className="mb-1 text-left text-[13px] font-bold text-foreground">Event QR Code</p>
                                    <p className="mb-4 text-left text-[11.5px] text-muted-foreground">
                                        Print this on your invitation. The code carries your event details in
                                        encrypted form &mdash; only this app can read it back.
                                    </p>
                                    <EventQr token={created?.qr_token} eventName={created?.name} size={190} />
                                </div>

                                {/* The event exists by now, so the QR is a real
                                    option here in a way it was not on step 5. */}
                                <DownloadMenu
                                    busy={downloading}
                                    withQr={!!created?.qr_token}
                                    onPick={(format) => downloadInvitation(format)}
                                />

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

/**
 * The title at the top of one of step 2's two panels.
 *
 * Left-aligned with a short accent rule under it, deliberately unlike
 * `SectionRule` — a centred rule at the top of a column reads as a divider
 * BETWEEN two things rather than as the heading OF the one below it.
 */
function PanelHeading({ label }: { label: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-[13px] font-bold text-foreground">{label}</p>
            <span className="h-0.5 w-8 rounded-full bg-primary" />
        </div>
    );
}

/**
 * A titled rule between groups of fields INSIDE a panel.
 *
 * `col-span-full` so it still spans correctly if it ever sits in a grid rather
 * than a flex column — a heading occupying one grid cell would sit beside an
 * unrelated input and read as that field's label.
 */
function SectionRule({ label }: { label: string }) {
    return (
        <div className="relative col-span-full pt-2">
            <Separator className="absolute inset-x-0 top-1/2" />
            <span className="relative mx-auto block w-fit bg-card px-3 text-[12.5px] font-semibold text-primary">
                {label}
            </span>
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
            <SelectTrigger className={cn("h-11 w-full rounded-md", invalid && "border-destructive")}>
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
