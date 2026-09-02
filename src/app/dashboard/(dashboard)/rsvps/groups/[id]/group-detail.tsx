'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Users, CircleCheck, CircleHelp, CircleX, Mail, Send, Eye,
    Pencil, MoreVertical, UsersRound, Loader2, Calendar, Download, Info,
    UserRound, Lock, Phone, Minus, Plus,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import {
    useRsvpGroup, useMoveToGroup, useUpdateRsvp,
    BUCKET_LABEL, BUCKET_STYLE, formatDate, formatTime, RESPONSE_OPTIONS,
    type Rsvp, type RsvpBucket, type ResponseType,
} from '@/hooks/use-rsvps';
import { useAllGuestGroups } from '@/hooks/use-guests';
import { useComposer } from '@/hooks/use-messages';
import { useDateFormatter } from '@/hooks/use-client-settings';

/**
 * Group details.
 *
 * ── ⚠ SCOPED TO ONE EVENT, AND IT HAS TO BE ────────────────────────────────
 * A group is client-scoped but its members belong to EVENTS. "8 members, 3
 * accepted" is only a true sentence about a single event — across two it would
 * double-count anybody invited to both. The event selector is therefore part of
 * the reading, not a convenience, and the heading names the event it is
 * describing.
 *
 * ── GROUP ACTIVITY IS DERIVED ───────────────────────────────────────────────
 * Real responses only, newest first. A group where nobody has replied shows
 * nothing rather than a list of "no response" rows, which is not activity.
 *
 * ── "REMOVE FROM GROUP" DOES NOT REMOVE A GUEST ─────────────────────────────
 * It clears their group and leaves them on the event, exactly as the design's
 * own note says ("their RSVP status and details will remain unchanged"). It is
 * the same call as Move, with no target.
 */

const TILES: { key: RsvpBucket; label: string; icon: React.ElementType; tint: string }[] = [
    { key: 'accepted', label: 'Accepted', icon: CircleCheck, tint: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
    { key: 'maybe', label: 'Maybe', icon: CircleHelp, tint: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    { key: 'declined', label: 'Declined', icon: CircleX, tint: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
    { key: 'no_response', label: 'No Response', icon: Mail, tint: 'bg-muted text-muted-foreground' },
];

export default function GroupDetailScreen({ groupId }: { groupId: number }) {
    const params = useSearchParams();
    const [eventId, setEventId] = useState<string>(params.get('event_id') ?? 'all');

    const { data, isLoading, isError } = useRsvpGroup(groupId, eventId === 'all' ? undefined : eventId);
    const { data: composer } = useComposer();
    const { data: groups } = useAllGuestGroups();
    const move = useMoveToGroup();
    const fmt = useDateFormatter();

    const [moving, setMoving] = useState<Rsvp | null>(null);
    /* The two the design draws as popups. Both were page navigations. */
    const [viewing, setViewing] = useState<Rsvp | null>(null);
    const [editing, setEditing] = useState<Rsvp | null>(null);
    const [target, setTarget] = useState<string>('none');

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5 p-4 md:p-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-28 rounded-xl" />
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <Skeleton className="h-96 rounded-xl" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        );
    }

    if (isError || !data?.group) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
                <p className="text-sm font-medium">Group not found</p>
                <p className="text-[12.5px] text-muted-foreground">
                    This group does not exist, or it is not on your account.
                </p>
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/rsvps">Back to RSVPs</Link>
                </Button>
            </div>
        );
    }

    const { group, event, stats, members, activity } = data;

    return (
        <div className="flex min-w-0 flex-col gap-5 p-4 md:p-6">
            <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit text-muted-foreground">
                <Link href="/dashboard/rsvps">
                    <ArrowLeft className="size-3.5" /> Back to RSVPs
                </Link>
            </Button>

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight">Group Details</h1>
                    <p className="text-sm break-words text-muted-foreground">
                        RSVP responses for everyone in this group.
                    </p>
                </div>
                {/*
                  The group is client-scoped; the counts are not. Choosing the
                  event is part of reading this screen correctly.
                */}
                <Select value={eventId} onValueChange={setEventId}>
                    <SelectTrigger className="w-[210px] text-[12.5px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All events</SelectItem>
                        {(composer?.events ?? []).map((e) => (
                            <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <Card className="py-0">
                <CardContent className="flex min-w-0 flex-wrap items-center gap-5 p-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <span
                            className="grid size-12 shrink-0 place-items-center rounded-full text-[15px] font-bold"
                            style={{
                                backgroundColor: `${group.color ?? '#8B5CF6'}22`,
                                color: group.color ?? '#8B5CF6',
                            }}
                        >
                            {group.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                            <p className="text-lg font-semibold break-words">{group.name}</p>
                            <p className="flex min-w-0 items-center gap-1.5 text-[11.5px] break-words text-muted-foreground">
                                <Calendar className="size-3 shrink-0" />
                                {event
                                    ? `${event.name}${event.start_date ? ` · ${formatDate(event.start_date)}` : ''}`
                                    : 'Across all events'}
                            </p>
                        </div>
                    </div>

                    <Separator orientation="vertical" className="!h-12" />

                    <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                            <Users className="size-5 text-primary" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[11px] text-muted-foreground">Total Members</p>
                            <p className="text-xl leading-tight font-bold tabular-nums">
                                {stats.total_members}
                            </p>
                            {/* Rows vs heads, again — the two are never equal. */}
                            <p className="text-[10.5px] text-muted-foreground">
                                {stats.heads} people expected
                            </p>
                        </div>
                    </div>

                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                        {TILES.map((t) => (
                            <div key={t.key} className="min-w-0">
                                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <t.icon className="size-3 shrink-0" /> {t.label}
                                </p>
                                <p className="text-lg leading-tight font-bold tabular-nums">
                                    {stats[t.key]}
                                </p>
                                <p className="text-[10.5px] text-muted-foreground">
                                    {stats[`${t.key}_pct` as keyof typeof stats]}%
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                {/* ── Members ──────────────────────────────────────────────── */}
                <Card className="py-0">
                    <CardContent className="flex min-w-0 flex-col gap-4 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[13.5px] font-semibold">
                                Group Members ({members.length})
                            </span>
                            {/*
                              Exporting the group means exporting the RSVP list
                              filtered to it — one export, one set of rules.
                            */}
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/dashboard/rsvps?group_id=${group.id}${event ? `&event_id=${event.id}` : ''}`}>
                                    <Download className="size-3.5" /> Open in RSVPs
                                </Link>
                            </Button>
                        </div>

                        {members.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
                                <UsersRound className="size-5 text-muted-foreground/60" />
                                <p className="text-[13px] font-semibold">Nobody here yet</p>
                                <p className="max-w-sm text-[12px] break-words text-muted-foreground">
                                    {event
                                        ? `No guest in this group is on ${event.name}.`
                                        : 'This group has no guests yet.'}
                                </p>
                            </div>
                        ) : (
                            /* Scrolls inside its own box — the page must never
                               scroll sideways. */
                            <div className="w-full overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Guest</TableHead>
                                            <TableHead className="min-w-[190px]">Email</TableHead>
                                            <TableHead className="min-w-[120px]">Status</TableHead>
                                            <TableHead className="min-w-[90px] text-end">Guests</TableHead>
                                            <TableHead className="min-w-[150px]">Response Date</TableHead>
                                            <TableHead className="min-w-[80px] text-end">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell className="max-w-[240px]">
                                                    {/* The name goes to the PERSON,
                                                        matching the RSVP list. The
                                                        row menu holds everything
                                                        about this one invitation. */}
                                                    <Link
                                                        href={`/dashboard/guests/${m.id}/profile`}
                                                        title={`View ${m.guest.name}'s profile`}
                                                        className="text-[12.5px] font-medium break-words hover:text-primary hover:underline"
                                                    >
                                                        {m.guest.name}
                                                    </Link>
                                                    {m.guest.mobile ? (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {m.guest.dial_code} {m.guest.mobile}
                                                        </p>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell className="max-w-[220px] text-[12px] break-all text-muted-foreground">
                                                    {m.guest.email || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="ghost" className={BUCKET_STYLE[m.bucket]}>
                                                        {BUCKET_LABEL[m.bucket]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-end text-[12.5px] tabular-nums">
                                                    {m.party_size}
                                                </TableCell>
                                                <TableCell className="text-[12px] whitespace-nowrap">
                                                    {m.responded_at
                                                        ? fmt(m.responded_at, true)
                                                        : <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell className="text-end">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="size-8"
                                                                aria-label="More actions">
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {/*
                                                              Dialogs, not
                                                              navigations. You
                                                              are working THROUGH
                                                              a member list —
                                                              leaving the page to
                                                              read one row loses
                                                              your scroll position
                                                              and your place in it.
                                                            */}
                                                            <DropdownMenuItem onClick={() => setViewing(m)}>
                                                                <Eye className="size-3.5" /> View member details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setEditing(m)}>
                                                                <Pencil className="size-3.5" /> Edit member
                                                            </DropdownMenuItem>
                                                            {/* The PERSON, across every event — a full
                                                                page, because it is one. */}
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/dashboard/guests/${m.id}/profile`}>
                                                                    <UserRound className="size-3.5" /> Guest profile
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/dashboard/messages/send?event_id=${m.event?.id ?? ''}&guest_id=${m.id}&kind=reminder&from=rsvps`}>
                                                                    <Send className="size-3.5" /> Send message
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => { setMoving(m); setTarget('none'); }}
                                                            >
                                                                <UsersRound className="size-3.5" /> Move to another group
                                                            </DropdownMenuItem>
                                                            {/*
                                                              Clears the GROUP, not the guest —
                                                              which is what the design's own note
                                                              promises. Same call as Move, with
                                                              no target.
                                                            */}
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() => move.mutate({ id: m.id, group_id: null })}
                                                            >
                                                                <UsersRound className="size-3.5" /> Remove from group
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Rail ─────────────────────────────────────────────────── */}
                <div className="flex min-w-0 flex-col gap-5">
                    <Card className="py-0">
                        <CardContent className="flex min-w-0 flex-col gap-3 p-5">
                            <span className="text-[13.5px] font-semibold">Group Overview</span>
                            <dl className="flex flex-col gap-2.5 text-[12.5px]">
                                <Row label="Group name" value={group.name} />
                                <Row label="Event" value={event?.name ?? 'All events'} />
                                {event?.start_date ? (
                                    <Row
                                        label="Event date"
                                        value={`${formatDate(event.start_date)}${event.start_time ? `, ${formatTime(event.start_time)}` : ''}`}
                                    />
                                ) : null}
                                <Row label="Total members" value={String(stats.total_members)} />
                                <Row label="People expected" value={String(stats.heads)} />
                                <Row label="Created" value={fmt(group.created_at)} />
                                {group.is_default ? <Row label="Default group" value="Yes" /> : null}
                            </dl>
                            {group.description ? (
                                <>
                                    <Separator />
                                    <p className="text-[11.5px] break-words text-muted-foreground">
                                        {group.description}
                                    </p>
                                </>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card className="py-0">
                        <CardContent className="flex min-w-0 flex-col gap-3 p-5">
                            <div className="flex items-center gap-2.5">
                                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                                    <Send className="size-4 text-primary" />
                                </span>
                                <span className="text-[13.5px] font-semibold">Message Group</span>
                            </div>
                            <p className="text-[12px] break-words text-muted-foreground">
                                Send a message to everyone in this group.
                            </p>
                            {/*
                              Hands the composer the group. A second sending path
                              would mean a second set of rules about who is
                              reachable, which is how a review step and a send
                              come to disagree.
                            */}
                            <Button asChild size="sm" className="w-full" disabled={!event}>
                                <Link href={`/dashboard/messages/send?event_id=${event?.id ?? ''}&group_id=${group.id}&from=rsvps`}>
                                    <Send className="size-3.5" /> Message Group
                                </Link>
                            </Button>
                            {!event ? (
                                <p className="flex min-w-0 items-start gap-2 text-[11px] break-words text-muted-foreground">
                                    <Info className="mt-0.5 size-3 shrink-0" />
                                    A message goes to one event&rsquo;s guests, so choose an event above
                                    first.
                                </p>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card className="py-0">
                        <CardContent className="flex min-w-0 flex-col gap-3 p-5">
                            <span className="text-[13.5px] font-semibold">Group Activity</span>
                            {activity.length === 0 ? (
                                /* Real responses only — a list of "no response"
                                   rows is not activity. */
                                <p className="rounded-lg border border-dashed px-3 py-5 text-center text-[11.5px] break-words text-muted-foreground">
                                    Nobody in this group has replied yet.
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-2.5">
                                    {activity.map((a) => (
                                        <li key={`${a.guest_id}-${a.at}`} className="flex min-w-0 items-start gap-2.5">
                                            <span className={`mt-1 size-2 shrink-0 rounded-full ${
                                                a.bucket === 'accepted' ? 'bg-emerald-500'
                                                    : a.bucket === 'declined' ? 'bg-rose-500'
                                                        : a.bucket === 'maybe' ? 'bg-amber-500' : 'bg-muted-foreground'
                                            }`} />
                                            <div className="min-w-0">
                                                <p className="text-[12px] break-words">
                                                    <Link href={`/dashboard/rsvps/${a.guest_id}`} className="font-medium hover:underline">
                                                        {a.name}
                                                    </Link>{' '}
                                                    <span className="text-muted-foreground">
                                                        {a.bucket === 'accepted' ? 'accepted'
                                                            : a.bucket === 'declined' ? 'declined'
                                                                : 'replied maybe'}
                                                    </span>
                                                </p>
                                                <p className="text-[10.5px] text-muted-foreground">
                                                    {fmt(a.at, true)}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Move member ──────────────────────────────────────────────── */}
            <MemberDialog
                member={viewing}
                fmt={fmt}
                eventName={event?.name ?? null}
                onClose={() => setViewing(null)}
                onEdit={() => { const m = viewing; setViewing(null); setEditing(m); }}
            />

            <EditMemberDialog
                key={editing ? `edit-${editing.id}` : 'edit-none'}
                member={editing}
                onClose={() => setEditing(null)}
            />

            <Dialog open={!!moving} onOpenChange={(open) => { if (!open) setMoving(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move to another group</DialogTitle>
                        <DialogDescription>
                            <span className="font-medium text-foreground">{moving?.guest.name}</span>{' '}
                            leaves {group.name} and joins the group you choose.{' '}
                            {/* Exactly what the design promises, and what the
                                service actually does. */}
                            Their RSVP and details are unchanged.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-[12px] font-medium">Move to</span>
                        <Select value={target} onValueChange={setTarget}>
                            <SelectTrigger className="w-full text-[12.5px]">
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No group</SelectItem>
                                {(groups ?? []).filter((g) => g.id !== group.id).map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMoving(null)}>Cancel</Button>
                        <Button
                            disabled={move.isPending}
                            onClick={() => {
                                if (!moving) return;
                                move.mutate(
                                    { id: moving.id, group_id: target === 'none' ? null : Number(target) },
                                    { onSuccess: () => setMoving(null) },
                                );
                            }}
                        >
                            {move.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                            Move member
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex min-w-0 items-start justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-end font-medium break-words">{value}</dd>
        </div>
    );
}

/* ── Member details ──────────────────────────────────────────────────────── */

/**
 * Read-only, and a DIALOG rather than a page.
 *
 * You reach this while working down a member list; leaving the page to read one
 * row costs your scroll position and your place in the list. The full RSVP page
 * still exists and is linked from the footer for when you want it.
 */
function MemberDialog({ member, fmt, eventName, onClose, onEdit }: {
    member: Rsvp | null;
    fmt: (v: string | number | Date | null | undefined, withTime?: boolean) => string;
    eventName: string | null;
    onClose: () => void;
    onEdit: () => void;
}) {
    if (!member) return null;
    const g = member.guest;

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle className="break-words">{g.name}</DialogTitle>
                    <DialogDescription>
                        Their response{eventName ? ` for ${eventName}` : ''}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="ghost" className={BUCKET_STYLE[member.bucket]}>
                            {BUCKET_LABEL[member.bucket]}
                        </Badge>
                        {member.responded_at ? (
                            <span className="text-[11.5px] text-muted-foreground">
                                Responded {fmt(member.responded_at, true)}
                            </span>
                        ) : (
                            <span className="text-[11.5px] text-muted-foreground">No response yet</span>
                        )}
                    </div>

                    <Separator />

                    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                        <DialogField icon={Mail} label="Email" value={g.email} breakAll />
                        <DialogField
                            icon={Phone} label="Phone"
                            value={g.mobile ? `${g.dial_code ?? ''} ${g.mobile}`.trim() : null}
                        />
                        <DialogField icon={UsersRound} label="Group" value={member.group?.name ?? null} />
                        <DialogField icon={Users} label="Number of guests" value={String(member.party_size)} />
                        <DialogField icon={Info} label="Meal preference" value={member.dietary_preference} />
                        <DialogField icon={Info} label="Special requirements" value={member.special_requirements} />
                    </div>

                    {member.notes ? (
                        <>
                            <Separator />
                            <div className="min-w-0">
                                {/* Labelled as the GUEST's words — the host's own
                                    notes live on the guest profile, and the two
                                    must not read as one. */}
                                <p className="text-[11px] text-muted-foreground">
                                    What the guest said with their reply
                                </p>
                                <p className="mt-1 rounded-lg border bg-muted/40 px-3 py-2 text-[12.5px] break-words">
                                    {member.notes}
                                </p>
                            </div>
                        </>
                    ) : null}
                </div>

                <DialogFooter className="flex-wrap gap-2 sm:justify-between">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/guests/${member.id}/profile`}>
                            <UserRound className="size-3.5" /> Full guest profile
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button onClick={onEdit}>
                            <Pencil className="size-3.5" /> Edit
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DialogField({ icon: Icon, label, value, breakAll }: {
    icon: React.ElementType; label: string; value?: string | null; breakAll?: boolean;
}) {
    return (
        <div className="flex min-w-0 items-start gap-2">
            <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className={`text-[12.5px] ${breakAll ? 'break-all' : 'break-words'} ${
                    value ? '' : 'text-muted-foreground'
                }`}>
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

/* ── Edit member ─────────────────────────────────────────────────────────── */

/**
 * ⚠ THE RESPONSE ONLY — NOT NAME, EMAIL OR PHONE.
 *
 * The supplied design's Edit Member popup writes Full Name, Email and Phone
 * Number. It must not: those columns belong to the Guests form, and letting two
 * screens write them under two sets of validation is how a mobile number ends
 * up valid on one and rejected on the other. The server refuses them here
 * regardless — this dialog agreeing with the API is cheaper than discovering
 * the disagreement later.
 *
 * They are shown READ-ONLY with a link to where they ARE editable, so the
 * dialog answers the question rather than pretending the fields do not exist.
 *
 * State is seeded from PROPS and the parent passes a `key`, so it is populated
 * once per open and never re-seeded over what somebody typed.
 */
function EditMemberDialog({ member, onClose }: { member: Rsvp | null; onClose: () => void }) {
    const [response, setResponse] = useState<ResponseType>(member?.response_type ?? 'none');
    const [partySize, setPartySize] = useState(member?.party_size ?? 1);
    const [meal, setMeal] = useState(member?.dietary_preference ?? '');
    const [notes, setNotes] = useState(member?.notes ?? '');

    const update = useUpdateRsvp(onClose);

    if (!member) return null;
    const g = member.guest;

    function submit() {
        if (update.isPending || !member) return;
        update.mutate({
            id: member.id,
            response_type: response,
            party_size: partySize,
            dietary_preference: meal.trim() || null,
            notes: notes.trim() || null,
        });
    }

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle className="break-words">Edit {g.name}</DialogTitle>
                    <DialogDescription>
                        Update their RSVP. Every change is recorded in their response history.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex min-w-0 flex-col gap-4">
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                        <ReadOnlyField label="Full name" value={g.name} />
                        <ReadOnlyField label="Email" value={g.email} breakAll />
                    </div>
                    <p className="flex min-w-0 items-start gap-2 text-[11px] break-words text-muted-foreground">
                        <Lock className="mt-0.5 size-3 shrink-0" />
                        Contact details belong to the guest, not to this response.{' '}
                        <Link href={`/dashboard/guests/${g.id}`} className="font-medium text-primary hover:underline">
                            Edit them on the guest
                        </Link>
                        .
                    </p>

                    <Separator />

                    <div className="flex min-w-0 flex-col gap-1.5">
                        <Label className="text-[12px]">
                            Response <span className="text-destructive">*</span>
                        </Label>
                        {/* Only the RESPONSE is sent — the stored status is
                            derived server-side, so a row cannot contradict
                            itself. */}
                        <div className="grid grid-cols-2 gap-2">
                            {RESPONSE_OPTIONS.map((o) => {
                                const on = response === o.value;
                                return (
                                    <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => setResponse(o.value)}
                                        className={`flex min-w-0 items-center gap-2 rounded-lg border p-2.5 text-start text-[12.5px] transition-colors ${
                                            on ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-muted'
                                        }`}
                                    >
                                        <span className={`grid size-[15px] shrink-0 place-items-center rounded-full border-[1.5px] ${
                                            on ? 'border-primary' : 'border-muted-foreground/40'
                                        }`}>
                                            {on ? <span className="size-[7px] rounded-full bg-primary" /> : null}
                                        </span>
                                        <span className="min-w-0 break-words">{o.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <Label className="text-[12px]">Number of guests</Label>
                            <div className="flex w-fit items-center rounded-lg border">
                                <Button
                                    type="button" size="icon" variant="ghost" className="size-9 rounded-e-none"
                                    disabled={partySize <= 1}
                                    onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                                    aria-label="One fewer"
                                >
                                    <Minus className="size-3.5" />
                                </Button>
                                <Input
                                    value={partySize}
                                    onChange={(e) => {
                                        // Capped where the server caps it: a value
                                        // the API will reject should not be typeable.
                                        const n = Number(e.target.value.replace(/\D/g, ''));
                                        setPartySize(Math.min(50, Math.max(1, n || 1)));
                                    }}
                                    inputMode="numeric"
                                    className="h-9 w-14 rounded-none border-0 text-center text-[12.5px] shadow-none focus-visible:ring-0"
                                />
                                <Button
                                    type="button" size="icon" variant="ghost" className="size-9 rounded-s-none"
                                    disabled={partySize >= 50}
                                    onClick={() => setPartySize((n) => Math.min(50, n + 1))}
                                    aria-label="One more"
                                >
                                    <Plus className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <Label htmlFor="member-meal" className="text-[12px]">Meal preference</Label>
                            <Input
                                id="member-meal"
                                value={meal}
                                onChange={(e) => setMeal(e.target.value)}
                                placeholder="Vegetarian, Jain…"
                                className="h-9 text-[12.5px]"
                            />
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-1.5">
                        <Label htmlFor="member-note" className="text-[12px]">Response note</Label>
                        <Input
                            id="member-note"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                            placeholder="Anything they said with their reply."
                            className="h-9 text-[12.5px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={update.isPending}>Cancel</Button>
                    <Button onClick={submit} disabled={update.isPending}>
                        {update.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                        Update member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ReadOnlyField({ label, value, breakAll }: {
    label: string; value?: string | null; breakAll?: boolean;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <Label className="text-[12px] text-muted-foreground">{label}</Label>
            <div className={`min-w-0 rounded-lg border bg-muted/40 px-3 py-2 text-[12.5px] ${
                breakAll ? 'break-all' : 'break-words'
            } ${value ? '' : 'text-muted-foreground'}`}>
                {value || '—'}
            </div>
        </div>
    );
}
