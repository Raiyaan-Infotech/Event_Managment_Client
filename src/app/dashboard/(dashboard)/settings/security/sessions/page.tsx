'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, ShieldCheck, RefreshCw, LogOut, Monitor, Smartphone, Tablet,
    Loader2, Info, KeyRound, Mail, TriangleAlert, MoreVertical,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useDateFormatter } from '@/hooks/use-client-settings';
import {
    useSessions, useRevokeSession, useRevokeOtherSessions, type ClientSession,
} from '@/hooks/use-client-security';

/**
 * Active Sessions.
 *
 * ── THIS SCREEN COULD NOT HAVE EXISTED BEFORE ───────────────────────────────
 * Sign-in used to issue a stateless JWT that nothing recorded, so there was no
 * list to show and "Log Out" on another device could not have worked — it would
 * have cleared a cookie and left the token valid for another seven days. Every
 * sign-in now writes a `client_sessions` row keyed on the refresh token's own
 * id, and revoking that row is what actually ends the session.
 *
 * ── ⚠ THE DESIGN'S "Mumbai, India" COLUMN IS NOT HERE ───────────────────────
 * Turning an IP into a city needs a GeoIP service, and there is none. The column
 * shows the IP address instead. This is the one screen where somebody decides
 * whether they recognise a login, so a plausible-looking city that was guessed
 * would be worse than no city at all. The server reports `location_available`,
 * so this stops being a caveat on its own the day a lookup is added.
 *
 * ── ONE ROW CANNOT BE SIGNED OUT: YOUR OWN ──────────────────────────────────
 * The server decides which row is "this device" from the caller's own token, and
 * "Log Out All Other Sessions" spares it there rather than here — so the button
 * behaves the same however it is called.
 */
export default function ActiveSessionsPage() {
    const { data, isLoading, isFetching, refetch } = useSessions();
    const revoke = useRevokeSession();
    const revokeAll = useRevokeOtherSessions();
    const [confirmAll, setConfirmAll] = useState(false);

    const sessions = data?.sessions ?? [];
    const others = sessions.filter((s) => !s.is_current);

    return (
        <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-1">
                <Button asChild variant="link" size="sm" className="h-auto w-fit p-0 text-[12.5px]">
                    <Link href="/dashboard/settings?tab=security">
                        <ArrowLeft className="size-3.5" /> Back to Security
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">Active Sessions</h1>
                <p className="text-sm text-muted-foreground">
                    These are the devices and browsers that are currently signed in to your account.
                </p>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-primary/5 p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="min-w-0 text-[12.5px] break-words text-muted-foreground">
                    If you see any unfamiliar device or location, sign out of that session and change
                    your password.
                </p>
            </div>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Card className="py-0">
                    <CardContent className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-[15px] font-semibold">
                                All Sessions {!isLoading && `(${sessions.length})`}
                            </h2>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button
                                    variant="ghost" size="sm"
                                    disabled={isFetching}
                                    onClick={() => refetch()}
                                >
                                    {isFetching
                                        ? <Loader2 className="size-3.5 animate-spin" />
                                        : <RefreshCw className="size-3.5" />}
                                    Refresh
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    className="border-destructive/50 text-destructive"
                                    disabled={!others.length || revokeAll.isPending}
                                    onClick={() => setConfirmAll(true)}
                                >
                                    <LogOut className="size-3.5" /> Log Out All Other Sessions
                                </Button>
                            </div>
                        </div>

                        {/* Scrolls inside itself; the page body never scrolls sideways. */}
                        <div className="mt-4 -mx-1 overflow-x-auto px-1">
                            <table className="w-full min-w-[640px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b text-[11px] font-medium text-muted-foreground">
                                        <th className="pb-2.5 pr-3 font-medium">Device &amp; Browser</th>
                                        <th className="pb-2.5 pr-3 font-medium">IP Address</th>
                                        <th className="pb-2.5 pr-3 font-medium">Last Active</th>
                                        <th className="pb-2.5 pr-3 font-medium">Status</th>
                                        <th className="pb-2.5 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading
                                        ? [0, 1, 2].map((i) => (
                                            <tr key={i} className="border-b last:border-b-0">
                                                <td colSpan={5} className="py-3">
                                                    <Skeleton className="h-9 w-full" />
                                                </td>
                                            </tr>
                                        ))
                                        : sessions.map((s) => (
                                            <SessionRow
                                                key={s.id}
                                                session={s}
                                                busy={revoke.isPending}
                                                onRevoke={() => revoke.mutate(s.id)}
                                            />
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {!isLoading && !sessions.length && (
                            <p className="mt-4 rounded-lg border border-dashed p-4 text-[12.5px] text-muted-foreground">
                                No active sessions. If you are reading this, your own session was
                                issued before sign-in was recorded — it will appear here after you
                                sign in again.
                            </p>
                        )}

                        {/* ⚠ The reason there is no Location column, in the
                            server's own words. Disappears by itself if a lookup
                            is ever connected. */}
                        {data && !data.location_available && (
                            <p className="mt-4 flex min-w-0 items-start gap-2 rounded-lg border bg-muted/40 px-3.5 py-2.5 text-[11.5px] break-words text-muted-foreground">
                                <Info className="mt-0.5 size-3.5 shrink-0" />
                                {data.location_note}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <SecurityTipsCard />
            </div>

            <Card className="py-0">
                <CardContent className="flex min-w-0 items-start gap-3 p-5">
                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold">What is an active session?</p>
                        <p className="mt-1 text-[12px] break-words text-muted-foreground">
                            A session means your account is signed in on that device or browser. You
                            can sign out of any session you do not recognise; that device will have to
                            sign in again. Sessions also end on their own after seven days without use.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={confirmAll} onOpenChange={setConfirmAll}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign out of all other sessions?</DialogTitle>
                        <DialogDescription>
                            {others.length === 1
                                ? '1 other device will be signed out immediately.'
                                : `${others.length} other devices will be signed out immediately.`}{' '}
                            This device stays signed in. Anyone using those devices will need to sign
                            in again.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmAll(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={revokeAll.isPending}
                            onClick={() => revokeAll.mutate(undefined, { onSuccess: () => setConfirmAll(false) })}
                        >
                            {revokeAll.isPending && <Loader2 className="size-4 animate-spin" />}
                            Log Out All Others
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function DeviceIcon({ session }: { session: ClientSession }) {
    const Icon = session.transport === 'app' || session.device_type === 'mobile'
        ? Smartphone
        : session.device_type === 'tablet' ? Tablet : Monitor;
    return (
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
        </span>
    );
}

function SessionRow({
    session, busy, onRevoke,
}: { session: ClientSession; busy: boolean; onRevoke: () => void }) {
    const fmt = useDateFormatter();

    return (
        <tr className="border-b align-top last:border-b-0">
            <td className="py-3.5 pr-3">
                <div className="flex min-w-0 items-start gap-2.5">
                    <DeviceIcon session={session} />
                    <div className="min-w-0">
                        {session.is_current && (
                            <Badge variant="secondary" className="mb-1 h-4 px-1.5 text-[9.5px]">
                                Current Session
                            </Badge>
                        )}
                        <p className="text-[12.5px] font-medium break-words">{session.device_name}</p>
                        <p className="mt-0.5 text-[11px] break-words text-muted-foreground">
                            {session.transport === 'app' ? 'Mobile app' : session.os || 'Unknown platform'}
                        </p>
                    </div>
                </div>
            </td>
            {/* The IP, and only the IP — there is no location service. */}
            <td className="py-3.5 pr-3 text-[12px] break-all text-muted-foreground">
                {session.ip_address ?? '—'}
            </td>
            <td className="py-3.5 pr-3 text-[12px] text-muted-foreground">
                {session.is_current ? 'Just now' : fmt(session.last_active_at, true)}
            </td>
            <td className="py-3.5 pr-3">
                <Badge
                    variant="secondary"
                    className={session.is_trusted
                        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : ''}
                >
                    {session.is_trusted ? 'Trusted' : 'Active'}
                </Badge>
            </td>
            <td className="py-3.5">
                {session.is_current ? (
                    // Signing yourself out from a row labelled "this device" is a
                    // different action (Log out), on a different control.
                    <span className="text-[12px] text-muted-foreground">—</span>
                ) : (
                    <div className="flex items-center gap-1">
                        <Button
                            size="sm" variant="outline"
                            className="border-destructive/40 text-destructive"
                            disabled={busy}
                            onClick={onRevoke}
                        >
                            Log Out
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="size-8" aria-label="More actions">
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem variant="destructive" onClick={onRevoke}>
                                    <LogOut className="size-3.5" /> Sign out this device
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </td>
        </tr>
    );
}

/**
 * The design's "Keep Your Account Secure" rail.
 *
 * Every line links to something that exists. "Enable 2FA" points at the real
 * screen; the email-alerts line points at the switch that actually records the
 * preference — with the caveat that nothing is delivered yet living on that
 * screen, where it belongs, rather than being repeated here.
 */
function SecurityTipsCard() {
    const tips = [
        {
            icon: <KeyRound className="size-4 text-emerald-600" />,
            tone: 'bg-emerald-500/10',
            title: 'Use a strong password',
            body: 'Make sure it is unique and hard to guess.',
            href: '/dashboard/settings?tab=security',
        },
        {
            icon: <ShieldCheck className="size-4 text-violet-600" />,
            tone: 'bg-violet-500/10',
            title: 'Enable 2FA',
            body: 'Two-factor authentication adds an extra layer of security.',
            href: '/dashboard/settings/security/two-factor',
        },
        {
            icon: <Mail className="size-4 text-amber-600" />,
            tone: 'bg-amber-500/10',
            title: 'Check your email alerts',
            body: 'Get told when a new device signs in.',
            href: '/dashboard/settings?tab=security',
        },
        {
            icon: <TriangleAlert className="size-4 text-rose-600" />,
            tone: 'bg-rose-500/10',
            title: 'Log out when needed',
            body: 'Always sign out on shared or public devices.',
            href: null,
        },
    ];

    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <div className="flex flex-col items-center text-center">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10">
                        <ShieldCheck className="size-5 text-primary" />
                    </span>
                    <h3 className="mt-3 text-[13.5px] font-semibold">Keep Your Account Secure</h3>
                    <p className="mt-1 text-[12px] break-words text-muted-foreground">
                        Follow these tips to help keep your account protected.
                    </p>
                </div>

                <div className="mt-4 flex flex-col gap-3.5">
                    {tips.map((t) => {
                        const body = (
                            <>
                                <span className={`grid size-8 shrink-0 place-items-center rounded-full ${t.tone}`}>
                                    {t.icon}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[12px] font-medium">{t.title}</span>
                                    <span className="block text-[11px] break-words text-muted-foreground">{t.body}</span>
                                </span>
                            </>
                        );
                        return t.href ? (
                            <Link
                                key={t.title} href={t.href}
                                className="flex items-start gap-2.5 rounded-md transition-colors hover:bg-muted/50"
                            >
                                {body}
                            </Link>
                        ) : (
                            <div key={t.title} className="flex items-start gap-2.5">{body}</div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
