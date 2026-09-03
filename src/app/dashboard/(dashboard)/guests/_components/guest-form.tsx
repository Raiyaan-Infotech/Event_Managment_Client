"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser, faCalendarDays, faLocationDot, faPeopleGroup, faCircleCheck,
    faPhone, faBuilding, faEnvelope, faPlus, faChevronDown, faLightbulb,
    faArrowRight, faMapLocationDot, faClipboardList, faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EventThumbnail } from "@/components/common/event-thumbnail";
import { TemplateArtwork } from "@/components/common/template-artwork";
import type { InvitationData } from "@/components/common/invitation-card";
import { resolveArtwork } from "@/lib/event-templates";
import { useClientEvents } from "@/hooks/use-client-events";
import { useEventOptions } from "@/hooks/use-client-portal";
import {
    useAllGuestGroups, useCreateGuest, useUpdateGuest, useGuest,
    type GuestPayload, type RsvpStatus, type ResponseType,
} from "@/hooks/use-guests";

/**
 * Add / Edit Guest — the same form for both.
 *
 * "Add More Details" is a COLLAPSIBLE section here rather than a second route.
 * The design shows it both ways (inline on Add Guest, and as its own
 * breadcrumbed step) but the fields are identical, and two pages editing one
 * record is how a field added to one goes missing from the other.
 *
 * ── STATUS AND RESPONSE ──────────────────────────────────────────────────────
 * The form offers both because they are two fields, and keeps them in step as
 * you change either — a guest must never read `Declined` beside a `Yes`. The
 * server enforces the same rule; this is the same decision made twice on
 * purpose, so the UI never shows a state the API would reject.
 */

const DIAL_CODES = ["+91", "+1", "+44", "+61", "+971", "+65"];

const TITLES = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];

const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
    { value: "not_responded", label: "Not Responded" },
    { value: "invited", label: "Invited" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "declined", label: "Declined" },
];

const RESPONSE_OPTIONS: { value: ResponseType; label: string }[] = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "maybe", label: "Maybe" },
];

/** Status implied by a response. The single mapping, mirrored from the server. */
const STATUS_FOR_RESPONSE: Record<Exclude<ResponseType, "none">, RsvpStatus> = {
    yes: "accepted",
    no: "declined",
    maybe: "pending",
};

interface FormState {
    event_id: string;
    group_id: string;
    title: string;
    first_name: string;
    last_name: string;
    email: string;
    dial_code: string;
    mobile: string;
    whatsapp: string;
    company: string;
    table_number: string;
    party_size: string;
    rsvp_status: RsvpStatus;
    response_type: ResponseType;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    dietary_preference: string;
    special_requirements: string;
    plus_one: boolean;
    plus_one_count: string;
    notes: string;
}

const EMPTY: FormState = {
    event_id: "", group_id: "", title: "", first_name: "", last_name: "", email: "",
    dial_code: "+91", mobile: "", whatsapp: "", company: "", table_number: "", party_size: "1",
    rsvp_status: "not_responded", response_type: "none",
    address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "India",
    dietary_preference: "", special_requirements: "", plus_one: false, plus_one_count: "0", notes: "",
};

export function GuestForm({ guestId }: { guestId?: number }) {
    const router = useRouter();
    const isEdit = !!guestId;

    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [sendInvite, setSendInvite] = useState(false);

    const events = useClientEvents({ limit: 100 });
    const eventOptions = useEventOptions();
    const groups = useAllGuestGroups();
    const existing = useGuest(guestId ?? null);

    const create = useCreateGuest(() => router.push("/dashboard/guests"));
    const update = useUpdateGuest(() => router.push("/dashboard/guests"));
    const saving = create.isPending || update.isPending;

    // Functional updater — a Select or a debounced field would otherwise write
    // back a stale snapshot of the whole form.
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key as string] ? { ...prev, [key]: false } : prev));
    };

    /**
     * Prefill once. Without the guard this re-ran on every background refetch
     * and threw away whatever had been typed since.
     */
    const [prefilled, setPrefilled] = useState(false);
    useEffect(() => {
        if (!isEdit || prefilled || !existing.data) return;
        const g = existing.data;
        setPrefilled(true);
        setForm({
            event_id: String(g.event_id ?? ""),
            group_id: g.group_id ? String(g.group_id) : "",
            title: g.title ?? "",
            first_name: g.first_name ?? g.name ?? "",
            last_name: g.last_name ?? "",
            email: g.email ?? "",
            dial_code: g.dial_code || "+91",
            mobile: g.mobile ?? "",
            whatsapp: g.whatsapp ?? "",
            company: g.company ?? "",
            table_number: g.table_number ?? "",
            party_size: String(g.party_size ?? 1),
            rsvp_status: g.rsvp_status,
            response_type: g.response_type,
            address_line1: g.address_line1 ?? "",
            address_line2: g.address_line2 ?? "",
            city: g.city ?? "",
            state: g.state ?? "",
            postal_code: g.postal_code ?? "",
            country: g.country ?? "India",
            dietary_preference: g.dietary_preference ?? "",
            special_requirements: g.special_requirements ?? "",
            plus_one: !!g.plus_one,
            plus_one_count: String(g.plus_one_count ?? 0),
            notes: g.notes ?? "",
        });
        // Open the extra section when it actually holds something, so an edit
        // does not hide half the record behind a collapsed header.
        if (g.address_line1 || g.city || g.dietary_preference || g.special_requirements || g.notes) {
            setDetailsOpen(true);
        }
    }, [isEdit, prefilled, existing.data]);

    const eventRows = events.data?.data ?? [];
    const selectedEvent = eventRows.find((e) => String(e.id) === form.event_id);
    const selectedGroup = (groups.data ?? []).find((g) => String(g.id) === form.group_id);

    // The real invitation — same resolution rule as the wizard's own preview
    // (§ event-templates.ts): an admin template if the theme_id matches one,
    // the older gradient-only card otherwise.
    const selectedArtwork = selectedEvent
        ? resolveArtwork(selectedEvent.theme_id, eventOptions.data?.templates)
        : null;
    const selectedInvitation: InvitationData | null = selectedEvent
        ? {
            name: selectedEvent.name,
            hostOne: selectedEvent.host_one,
            hostTwo: selectedEvent.host_two,
            tagline: selectedEvent.tagline,
            description: selectedEvent.description,
            startDate: selectedEvent.start_date,
            startTime: selectedEvent.start_time,
            endTime: selectedEvent.end_time,
            venueName: selectedEvent.venue_name,
            venueAddress: selectedEvent.venue_address,
            organizer: selectedEvent.organizer,
            contact: selectedEvent.contact_phone,
            footerNote: selectedEvent.footer_note,
            primaryColor: selectedEvent.primary_color,
            qrToken: selectedEvent.qr_token,
        }
        : null;

    /** Picking a response moves the status with it, and vice versa. */
    const pickResponse = (value: ResponseType) => {
        setForm((prev) => ({
            ...prev,
            response_type: value,
            rsvp_status: value === "none" ? prev.rsvp_status : STATUS_FOR_RESPONSE[value],
        }));
    };

    const pickStatus = (value: RsvpStatus) => {
        setForm((prev) => {
            const implied: ResponseType =
                value === "accepted" ? "yes" : value === "declined" ? "no" : value === "pending" ? "maybe" : "none";
            return { ...prev, rsvp_status: value, response_type: implied };
        });
    };

    const validate = () => {
        const next: Record<string, boolean> = {};
        if (!form.first_name.trim()) next.first_name = true;
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = true;
        if (!form.event_id) next.event_id = true;

        if (Object.keys(next).length) {
            setErrors(next);
            toast.error("Please fill all mandatory fields.");
            return false;
        }
        return true;
    };

    const submit = () => {
        if (saving || !validate()) return;

        const payload: GuestPayload = {
            event_id: Number(form.event_id),
            group_id: form.group_id ? Number(form.group_id) : null,
            title: form.title || null,
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim() || null,
            email: form.email.trim(),
            dial_code: form.dial_code,
            mobile: form.mobile.trim() || null,
            whatsapp: form.whatsapp.trim() || null,
            company: form.company.trim() || null,
            table_number: form.table_number.trim() || null,
            party_size: Number(form.party_size) || 1,
            rsvp_status: form.rsvp_status,
            response_type: form.response_type,
            address_line1: form.address_line1.trim() || null,
            address_line2: form.address_line2.trim() || null,
            city: form.city.trim() || null,
            state: form.state.trim() || null,
            postal_code: form.postal_code.trim() || null,
            country: form.country.trim() || null,
            dietary_preference: form.dietary_preference.trim() || null,
            special_requirements: form.special_requirements.trim() || null,
            plus_one: form.plus_one ? 1 : 0,
            plus_one_count: form.plus_one ? Number(form.plus_one_count) || 0 : 0,
            notes: form.notes.trim() || null,
        };

        if (sendInvite && payload.rsvp_status === "not_responded") {
            // "Send Invitation" with no delivery wired would be a lie, so it
            // records the INTENT — the guest is marked Invited, which is what
            // the RSVP counts and the response-rate denominator read.
            payload.rsvp_status = "invited";
        }

        if (isEdit && guestId) update.mutate({ id: guestId, data: payload });
        else create.mutate(payload);
    };

    if (isEdit && existing.isLoading) {
        return (
            <div className="flex flex-col gap-5">
                <Skeleton className="h-8 w-[200px]" />
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <Skeleton className="h-[420px] rounded-xl" />
                    <Skeleton className="h-[300px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="min-w-0">
                <h1 className="text-[24px] font-bold leading-tight tracking-tight text-foreground">
                    {isEdit ? "Edit Guest" : "Add Guest"}
                </h1>
                <p className="mt-1 text-[13.5px] text-muted-foreground">
                    {isEdit ? "Update this guest’s details." : "Add a new guest to your event."}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="flex min-w-0 flex-col gap-5">
                    {/* ── Guest information ───────────────────────────────── */}
                    <Card className="border border-border py-0 shadow-none">
                        <CardContent className="p-5">
                            <SectionHeader icon={faUser} title="Guest Information" />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="First Name" required error={errors.first_name}>
                                    <Input
                                        value={form.first_name}
                                        onChange={(e) => setField("first_name", e.target.value.slice(0, 100))}
                                        placeholder="Enter first name"
                                        className={cn("h-11 rounded-md", errors.first_name && "border-destructive")}
                                    />
                                </Field>
                                <Field label="Last Name">
                                    <Input
                                        value={form.last_name}
                                        onChange={(e) => setField("last_name", e.target.value.slice(0, 100))}
                                        placeholder="Enter last name"
                                        className="h-11 rounded-md"
                                    />
                                </Field>

                                <Field label="Email Address" required error={errors.email}>
                                    <div className="relative">
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 !size-[12px] text-muted-foreground"
                                        />
                                        <Input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setField("email", e.target.value.slice(0, 255))}
                                            placeholder="Enter email address"
                                            className={cn("h-11 rounded-md pl-9", errors.email && "border-destructive")}
                                        />
                                    </div>
                                </Field>

                                <Field label="Phone Number">
                                    <div className="flex gap-2">
                                        <Select value={form.dial_code} onValueChange={(v) => setField("dial_code", v)}>
                                            <SelectTrigger className="h-11 w-[104px] shrink-0 rounded-md text-[13px]">
                                                <FontAwesomeIcon icon={faPhone} className="mr-1 !size-[11px] text-muted-foreground" />
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DIAL_CODES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={form.mobile}
                                            // Digits only — a name in the phone box is
                                            // rejected by the server anyway, and stopping
                                            // it here beats a round trip to say so.
                                            onChange={(e) => setField("mobile", e.target.value.replace(/[^\d\s-]/g, "").slice(0, 20))}
                                            placeholder="Enter phone number"
                                            className="h-11 min-w-0 flex-1 rounded-md"
                                            inputMode="numeric"
                                        />
                                    </div>
                                </Field>

                                <Field label="Guest Group">
                                    <Select
                                        value={form.group_id || "none"}
                                        onValueChange={(v) => setField("group_id", v === "none" ? "" : v)}
                                    >
                                        <SelectTrigger className="h-11 w-full rounded-md text-[13px]">
                                            <FontAwesomeIcon icon={faPeopleGroup} className="mr-2 !size-[12px] text-muted-foreground" />
                                            <SelectValue placeholder="Select a group (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No group</SelectItem>
                                            {(groups.data ?? []).map((g) => (
                                                <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field label="Company / Organization">
                                    <div className="relative">
                                        <FontAwesomeIcon
                                            icon={faBuilding}
                                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 !size-[12px] text-muted-foreground"
                                        />
                                        <Input
                                            value={form.company}
                                            onChange={(e) => setField("company", e.target.value.slice(0, 200))}
                                            placeholder="Enter company or organization"
                                            className="h-11 rounded-md pl-9"
                                        />
                                    </div>
                                </Field>
                            </div>

                            {/* ── Add More Details ────────────────────────── */}
                            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="mt-5">
                                <CollapsibleTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-3 rounded-md border border-dashed border-border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                                    >
                                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10">
                                            <FontAwesomeIcon icon={faPlus} className="!size-[11px] text-primary" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[12.5px] font-semibold text-foreground">
                                                Add More Details (Optional)
                                            </span>
                                            <span className="block text-[11.5px] text-muted-foreground">
                                                Add address, title, notes or any other information about this guest.
                                            </span>
                                        </span>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={cn(
                                                "!size-[12px] shrink-0 text-muted-foreground transition-transform",
                                                detailsOpen && "rotate-180"
                                            )}
                                        />
                                    </button>
                                </CollapsibleTrigger>

                                <CollapsibleContent className="pt-5">
                                    <SectionHeader icon={faMapLocationDot} title="Address" />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Address Line 1">
                                            <Input value={form.address_line1}
                                                onChange={(e) => setField("address_line1", e.target.value.slice(0, 255))}
                                                placeholder="House no., Building, Street" className="h-11 rounded-md" />
                                        </Field>
                                        <Field label="Address Line 2 (Optional)">
                                            <Input value={form.address_line2}
                                                onChange={(e) => setField("address_line2", e.target.value.slice(0, 255))}
                                                placeholder="Apartment, Suite, Floor, etc." className="h-11 rounded-md" />
                                        </Field>
                                        <Field label="City">
                                            <Input value={form.city}
                                                onChange={(e) => setField("city", e.target.value.slice(0, 120))}
                                                placeholder="Enter city" className="h-11 rounded-md" />
                                        </Field>
                                        <Field label="State / Province">
                                            <Input value={form.state}
                                                onChange={(e) => setField("state", e.target.value.slice(0, 120))}
                                                placeholder="Enter state / province" className="h-11 rounded-md" />
                                        </Field>
                                        <Field label="PIN / Zip Code">
                                            <Input value={form.postal_code}
                                                onChange={(e) => setField("postal_code", e.target.value.replace(/[^\dA-Za-z\s-]/g, "").slice(0, 20))}
                                                placeholder="Enter PIN / Zip code" className="h-11 rounded-md" />
                                        </Field>
                                        <Field label="Country">
                                            <Input value={form.country}
                                                onChange={(e) => setField("country", e.target.value.slice(0, 100))}
                                                placeholder="Country" className="h-11 rounded-md" />
                                        </Field>
                                    </div>

                                    <Separator className="my-5" />
                                    <SectionHeader icon={faClipboardList} title="Additional Information" />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Title / Salutation">
                                            <Select value={form.title || "none"}
                                                onValueChange={(v) => setField("title", v === "none" ? "" : v)}>
                                                <SelectTrigger className="h-11 w-full rounded-md text-[13px]">
                                                    <SelectValue placeholder="Select (Optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Not set</SelectItem>
                                                    {TITLES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </Field>

                                        <Field label="Table Number (Optional)">
                                            <Input value={form.table_number}
                                                onChange={(e) => setField("table_number", e.target.value.slice(0, 30))}
                                                placeholder="e.g. Table 12" className="h-11 rounded-md" />
                                        </Field>

                                        <Field label="Dietary Preferences (Optional)">
                                            <Input value={form.dietary_preference}
                                                onChange={(e) => setField("dietary_preference", e.target.value.slice(0, 255))}
                                                placeholder="E.g., Vegetarian, Vegan, Gluten-free..." className="h-11 rounded-md" />
                                        </Field>

                                        <Field label="Party Size">
                                            <Input
                                                value={form.party_size}
                                                onChange={(e) => setField("party_size", e.target.value.replace(/\D/g, "").slice(0, 2))}
                                                placeholder="1" className="h-11 rounded-md" inputMode="numeric"
                                            />
                                            <p className="mt-1.5 text-[11px] text-muted-foreground">
                                                How many people this invitation covers.
                                            </p>
                                        </Field>

                                        <Field label="Notes (Optional)">
                                            <Textarea value={form.notes}
                                                onChange={(e) => setField("notes", e.target.value.slice(0, 300))}
                                                placeholder="Add any notes about this guest..."
                                                className="min-h-[84px] rounded-md" />
                                            <Counter value={form.notes.length} max={300} />
                                        </Field>

                                        <Field label="Special Requirements (Optional)">
                                            <Textarea value={form.special_requirements}
                                                onChange={(e) => setField("special_requirements", e.target.value.slice(0, 500))}
                                                placeholder="E.g., Accessibility, Seating preference..."
                                                className="min-h-[84px] rounded-md" />
                                        </Field>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
                                        <div className="min-w-0">
                                            <Label className="text-[12.5px] font-medium">Plus One</Label>
                                            <p className="text-[11.5px] text-muted-foreground">
                                                Allow this guest to bring a plus one.
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3">
                                            {form.plus_one && (
                                                <Input
                                                    value={form.plus_one_count}
                                                    onChange={(e) => setField("plus_one_count", e.target.value.replace(/\D/g, "").slice(0, 2))}
                                                    className="h-9 w-[64px] rounded-md text-center"
                                                    inputMode="numeric"
                                                    aria-label="Plus one count"
                                                />
                                            )}
                                            <Switch
                                                checked={form.plus_one}
                                                onCheckedChange={(v) => setField("plus_one", v)}
                                                aria-label="Allow a plus one"
                                            />
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </CardContent>
                    </Card>

                    {/* ── Event & RSVP ────────────────────────────────────── */}
                    <Card className="border border-border py-0 shadow-none">
                        <CardContent className="p-5">
                            <SectionHeader icon={faCalendarDays} title="Event & RSVP Settings" />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Select Event" required error={errors.event_id}>
                                    <Select value={form.event_id} onValueChange={(v) => setField("event_id", v)}>
                                        <SelectTrigger className={cn("h-11 w-full rounded-md text-[13px]", errors.event_id && "border-destructive")}>
                                            <SelectValue placeholder="Select an event" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {eventRows.map((e) => (
                                                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {selectedEvent && (
                                        <div className="mt-3 flex items-center gap-3 rounded-md bg-muted/40 p-3">
                                            <div className="relative h-[178px] w-[100px] shrink-0 overflow-hidden rounded-lg border border-border">
                                                {/*
                                                  The real invitation — same rule the wizard's own
                                                  preview uses: an admin template renders properly
                                                  (frame, decorations, the client's own text) via
                                                  `TemplateArtwork`; a legacy theme has no template
                                                  row to draw from, so it keeps the plain gradient card.
                                                */}
                                                {selectedArtwork?.kind === "template" && selectedInvitation ? (
                                                    <TemplateArtwork
                                                        template={selectedArtwork.template}
                                                        data={selectedInvitation}
                                                        cardClassName="rounded-lg shadow-none"
                                                    />
                                                ) : (
                                                    <EventThumbnail
                                                        themeId={selectedEvent.theme_id}
                                                        name={selectedEvent.name}
                                                        primaryColor={selectedEvent.primary_color}
                                                        className="absolute inset-0 h-full w-full rounded-lg border-0"
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0 text-[12.5px] text-muted-foreground">
                                                <p className="flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faCalendarDays} className="!size-[11px]" />
                                                    <span className="break-words">
                                                        {selectedEvent.start_date ?? "Date not set"}
                                                        {selectedEvent.start_time ? `, ${selectedEvent.start_time.slice(0, 5)}` : ""}
                                                    </span>
                                                </p>
                                                <p className="mt-1 flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faLocationDot} className="!size-[11px]" />
                                                    <span className="break-words">{selectedEvent.venue_name || "Venue not set"}</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Field>

                                <div className="flex flex-col gap-4">
                                    <Field label="Initial RSVP Status">
                                        <Select value={form.rsvp_status} onValueChange={(v) => pickStatus(v as RsvpStatus)}>
                                            <SelectTrigger className="h-11 w-full rounded-md text-[13px]">
                                                <FontAwesomeIcon icon={faCircleCheck} className="mr-2 !size-[12px] text-success" />
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map((o) => (
                                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[12.5px] font-medium">Response Type</Label>
                                        {/* Radios, not a select: three options that must be
                                            comparable at a glance, exactly as the design has. */}
                                        <div className="flex flex-wrap items-center gap-4">
                                            {RESPONSE_OPTIONS.map((o) => (
                                                <label key={o.value} className="flex cursor-pointer items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="response_type"
                                                        checked={form.response_type === o.value}
                                                        onChange={() => pickResponse(o.value)}
                                                        className="h-4 w-4 accent-[var(--color-primary)]"
                                                    />
                                                    <span className="text-[12.5px] text-foreground">{o.label}</span>
                                                </label>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => pickResponse("none")}
                                                className="text-[11.5px] text-muted-foreground hover:underline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Status and response move together — set either one.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-5" />

                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <Label className="text-[12.5px] font-medium">Send Invitation</Label>
                                    <p className="text-[11.5px] text-muted-foreground break-words">
                                        {/* Honest: no provider is wired, so this records the
                                            intent rather than claiming a delivery. */}
                                        Mark this guest as invited. Message delivery is not connected yet,
                                        so nothing is sent.
                                    </p>
                                </div>
                                <Switch checked={sendInvite} onCheckedChange={setSendInvite} aria-label="Mark as invited" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button asChild variant="outline" className="h-11 rounded-md px-5 text-[13px] font-medium">
                            <Link href="/dashboard/guests">Cancel</Link>
                        </Button>
                        <Button onClick={submit} disabled={saving} className="h-11 rounded-md px-6 text-[13px] font-semibold">
                            {saving ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Guest")}
                            {!saving && <FontAwesomeIcon icon={faUserPlus} className="ml-2 !size-[12px]" />}
                        </Button>
                    </div>
                </div>

                {/* ── Right rail ──────────────────────────────────────────── */}
                <div className="flex min-w-0 flex-col gap-5">
                    <Card className="border border-border py-0 shadow-none">
                        <CardContent className="p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10">
                                    <FontAwesomeIcon icon={faUser} className="!size-[11px] text-primary" />
                                </span>
                                <p className="text-[13px] font-bold text-foreground">Guest Summary</p>
                            </div>

                            <dl className="flex flex-col gap-2.5">
                                <SummaryRow icon={faCalendarDays} label="Event" value={selectedEvent?.name ?? "Not selected"} />
                                <SummaryRow
                                    icon={faCalendarDays}
                                    label="Date & Time"
                                    value={selectedEvent?.start_date
                                        ? `${selectedEvent.start_date}${selectedEvent.start_time ? `, ${selectedEvent.start_time.slice(0, 5)}` : ""}`
                                        : "—"}
                                />
                                <SummaryRow icon={faLocationDot} label="Venue" value={selectedEvent?.venue_name || "—"} />
                                <SummaryRow icon={faPeopleGroup} label="Group" value={selectedGroup?.name ?? "Not selected"} />
                                <div className="flex items-start gap-2.5">
                                    <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 !size-[11px] shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <dt className="text-[11px] text-muted-foreground">Status</dt>
                                        <dd className="mt-0.5">
                                            <Badge variant="ghost" className="rounded bg-success/15 px-2 py-0.5 text-[10.5px] font-semibold text-success">
                                                {STATUS_OPTIONS.find((o) => o.value === form.rsvp_status)?.label}
                                            </Badge>
                                        </dd>
                                    </div>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="border border-border py-0 shadow-none">
                        <CardContent className="p-4">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <p className="text-[13px] font-bold text-foreground">Guest Groups</p>
                                <Link href="/dashboard/guests/groups/add"
                                    className="shrink-0 text-[11.5px] font-semibold text-primary hover:underline">
                                    + Add Group
                                </Link>
                            </div>

                            {groups.isLoading ? (
                                <div className="flex flex-col gap-2">
                                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
                                </div>
                            ) : (groups.data ?? []).length === 0 ? (
                                <p className="py-2 text-[12px] text-muted-foreground">No groups yet.</p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {(groups.data ?? []).slice(0, 5).map((g) => (
                                        <li key={g.id}>
                                            <button
                                                type="button"
                                                onClick={() => setField("group_id", String(g.id))}
                                                className={cn(
                                                    "flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-muted/50",
                                                    form.group_id === String(g.id) && "bg-primary/10"
                                                )}
                                            >
                                                <Avatar className="h-7 w-7">
                                                    <AvatarFallback
                                                        className="text-[10px] font-bold"
                                                        style={{ backgroundColor: `${g.color ?? "#CBD5E1"}1A`, color: g.color ?? "#64748B" }}
                                                    >
                                                        {g.name.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">{g.name}</span>
                                                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                                                    {g.members_count}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <Separator className="my-3" />
                            <Link href="/dashboard/guests/groups"
                                className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:underline">
                                View All Groups
                                <FontAwesomeIcon icon={faArrowRight} className="!size-[9px]" />
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5 py-0 shadow-none">
                        <CardContent className="p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faLightbulb} className="!size-[12px] text-primary" />
                                <p className="text-[12.5px] font-bold text-primary">Pro Tip</p>
                            </div>
                            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                                Add guests in bulk by importing from a CSV file.
                            </p>
                            <Button asChild variant="outline" size="sm"
                                className="mt-3 h-8 w-full rounded-md border-primary/40 text-[12px] font-semibold text-primary hover:bg-primary/10 hover:text-primary">
                                <Link href="/dashboard/guests/import">
                                    Import Guests
                                    <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 !size-[10px]" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ── building blocks ────────────────────────────────────────────────────── */

function SectionHeader({ icon, title }: { icon: typeof faUser; title: string }) {
    return (
        <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10">
                <FontAwesomeIcon icon={icon} className="!size-[12px] text-primary" />
            </span>
            <p className="text-[13.5px] font-bold text-foreground">{title}</p>
        </div>
    );
}

function Field({
    label, required, error, children,
}: {
    label: string; required?: boolean; error?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <Label className="text-[12.5px] font-medium">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && <span className="text-[11px] text-destructive">This field is required.</span>}
        </div>
    );
}

function Counter({ value, max }: { value: number; max: number }) {
    return (
        <span className={cn("mt-1 self-end text-[11px]", value >= max ? "text-destructive" : "text-muted-foreground")}>
            {value}/{max}
        </span>
    );
}

function SummaryRow({ icon, label, value }: { icon: typeof faUser; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2.5">
            <FontAwesomeIcon icon={icon} className="mt-0.5 !size-[11px] shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
                <dt className="text-[11px] text-muted-foreground">{label}</dt>
                <dd className="text-[12px] font-medium text-foreground break-words">{value}</dd>
            </div>
        </div>
    );
}
