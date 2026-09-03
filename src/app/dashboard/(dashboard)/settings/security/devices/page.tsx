'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, ShieldCheck, RefreshCw, Monitor, Smartphone, Tablet, Loader2,
    Info, MapPin, MoreVertical, Trash2, KeyRound, UserCheck, Mail, ArrowRight,
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
import { useDevices, useRemoveDevice, type ClientSession } from '@/hooks/use-client-security';

/**
 * Authorized Devices.
 *
 * ── THE SAME ROWS AS ACTIVE SESSIONS, ASKED A DIFFERENT QUESTION ────────────
 * Sessions answers "where am I signed in right now"; this answers "which devices
 * can stay signed in". They read one table, deliberately — two would be two
 * copies of "which device is this", and the first symptom of them drifting is a
 * device you removed here still being able to sign in.
 *
 * So REMOVING a device signs it out. There is no state in which a device is
 * forgotten but still holds a working session, because that state is exactly
 * what somebody removing a device is trying to prevent.
 *
 * ── ⚠ NO LOCATION, FOR THE SAME REASON AS THE SESSIONS SCREEN ───────────────
 * The design puts a city under a map pin on every row. There is no GeoIP service
 * here, so the pin marks the IP address instead of a place that was guessed.
 */
export default function AuthorizedDevicesPage() {
    const { data, isLoading, isFetching, refetch } = useDevices();
    const remove = useRemoveDevice();
    const [confirm, setConfirm] = useState<ClientSession | null>(null);

    const devices = data?.devices ?? [];

    return (
        <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-1">
                <Button asChild variant="link" size="sm" className="h-auto w-fit p-0 text-[12.5px]">
                    <Link href="/dashboard/settings?tab=security">
                        <ArrowLeft className="size-3.5" /> Back to Security
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">Authorized Devices</h1>
                <p className="text-sm text-muted-foreground">
                    Manage the devices that have access to your account.
                </p>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-primary/5 p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold">What are authorized devices?</p>
                    <p className="mt-1 text-[12px] break-words text-muted-foreground">
                        These are the devices you have used to sign in to your account. Removing one
                        signs it out immediately — it will have to sign in again.
                    </p>
                </div>
            </div>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Card className="py-0">
                    <CardContent className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-[15px] font-semibold">
                                Your Devices {!isLoading && `(${devices.length})`}
                            </h2>
                            <Button variant="ghost" size="sm" disabled={isFetching} onClick={() => refetch()}>
                                {isFetching
                                    ? <Loader2 className="size-3.5 animate-spin" />
                                    : <RefreshCw className="size-3.5" />}
                                Refresh
                            </Button>
                        </div>

                        <div className="mt-4 flex flex-col">
                            {isLoading
                                ? [0, 1, 2].map((i) => (
                                    <Skeleton key={i} className="mb-2.5 h-16 w-full rounded-lg" />
                                ))
                                : devices.map((d) => (
                                    <DeviceRow
                                        key={d.id}
                                        device={d}
                                        busy={remove.isPending}
                                        onRemove={() => setConfirm(d)}
                                    />
                                ))}
                        </div>

                        {!isLoading && !devices.length && (
                            <p className="rounded-lg border border-dashed p-4 text-[12.5px] text-muted-foreground">
                                No devices yet. Devices appear here the first time they sign in.
                            </p>
                        )}

                        {data && !data.location_available && (
                            <p className="mt-4 flex min-w-0 items-start gap-2 rounded-lg border bg-muted/40 px-3.5 py-2.5 text-[11.5px] break-words text-muted-foreground">
                                <Info className="mt-0.5 size-3.5 shrink-0" />
                                Sign-in locations are not available — no IP-location service is
                                connected, so each device shows the IP address it last used.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <SecurityTipsCard />
            </div>

            <Card className="py-0">
                <CardContent className="flex min-w-0 flex-wrap items-center justify-between gap-4 p-5">
                    <div className="flex min-w-0 items-start gap-3">
                        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                            <p className="text-[12.5px] font-semibold">Notice something suspicious?</p>
                            <p className="mt-1 text-[12px] break-words text-muted-foreground">
                                If you believe your account has been compromised, change your password
                                — that signs out every other device — and turn on two-factor
                                authentication.
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                        <Link href="/dashboard/settings?tab=security">Change Password</Link>
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove this device?</DialogTitle>
                        <DialogDescription>
                            {confirm?.device_name} will be signed out immediately and will need to
                            sign in again.
                            {confirm?.is_current && ' This is the device you are using right now.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={remove.isPending}
                            onClick={() => {
                                if (!confirm) return;
                                remove.mutate(confirm.id, { onSuccess: () => setConfirm(null) });
                            }}
                        >
                            {remove.isPending && <Loader2 className="size-4 animate-spin" />}
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function DeviceRow({
    device, busy, onRemove,
}: { device: ClientSession; busy: boolean; onRemove: () => void }) {
    const fmt = useDateFormatter();
    const Icon = device.transport === 'app' || device.device_type === 'mobile'
        ? Smartphone
        : device.device_type === 'tablet' ? Tablet : Monitor;

    return (
        <div className="flex min-w-0 flex-wrap items-center gap-3 border-b py-3.5 last:border-b-0">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium break-words">{device.device_name}</p>
                    {device.is_current && (
                        <Badge variant="secondary" className="h-5 text-[10px]">Current Device</Badge>
                    )}
                    {device.is_trusted && (
                        <Badge className="h-5 border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-700 dark:text-emerald-400">
                            Trusted
                        </Badge>
                    )}
                </div>
                <p className="mt-0.5 text-[11.5px] break-words text-muted-foreground">
                    {[device.os, device.browser].filter(Boolean).join(' · ')
                        || (device.transport === 'app' ? 'Mobile app' : 'Unknown platform')}
                </p>
            </div>

            {/* The pin marks an IP, not a city. See the file header. */}
            <div className="flex min-w-0 shrink-0 items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="break-all">{device.ip_address ?? 'Unknown IP'}</span>
            </div>

            <div className="shrink-0 text-[11.5px] text-muted-foreground">
                <p className="font-medium text-foreground">Last active</p>
                <p>{device.is_current ? 'Just now' : fmt(device.last_active_at, true)}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
                {device.is_current ? (
                    <span className="px-2 text-[12px] text-muted-foreground">—</span>
                ) : (
                    <>
                        <Button
                            size="sm" variant="outline"
                            className="border-destructive/40 text-destructive"
                            disabled={busy}
                            onClick={onRemove}
                        >
                            Remove
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="size-8" aria-label="More actions">
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem variant="destructive" onClick={onRemove}>
                                    <Trash2 className="size-3.5" /> Remove device
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}
            </div>
        </div>
    );
}

function SecurityTipsCard() {
    const tips = [
        {
            icon: <Trash2 className="size-4 text-emerald-600" />, tone: 'bg-emerald-500/10',
            title: 'Remove unknown devices',
            body: 'If you see a device you do not recognise, remove it immediately.',
        },
        {
            icon: <UserCheck className="size-4 text-violet-600" />, tone: 'bg-violet-500/10',
            title: 'Keep your account secure',
            body: 'Use a strong password and do not share it with anyone.',
        },
        {
            icon: <KeyRound className="size-4 text-sky-600" />, tone: 'bg-sky-500/10',
            title: 'Enable 2FA',
            body: 'Two-factor authentication adds an extra layer of protection.',
        },
        {
            icon: <Mail className="size-4 text-amber-600" />, tone: 'bg-amber-500/10',
            title: 'Check your email alerts',
            body: 'Get told when a new device signs in to your account.',
        },
    ];

    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10">
                        <ShieldCheck className="size-4 text-primary" />
                    </span>
                    <h3 className="text-[13.5px] font-semibold">Security Tips</h3>
                </div>

                <div className="mt-4 flex flex-col gap-3.5">
                    {tips.map((t) => (
                        <div key={t.title} className="flex items-start gap-2.5">
                            <span className={`grid size-8 shrink-0 place-items-center rounded-full ${t.tone}`}>
                                {t.icon}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-[12px] font-medium">{t.title}</span>
                                <span className="block text-[11px] break-words text-muted-foreground">{t.body}</span>
                            </span>
                        </div>
                    ))}
                </div>

                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                    <Link href="/dashboard/settings?tab=security">
                        Go to Security Settings <ArrowRight className="size-3.5" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
