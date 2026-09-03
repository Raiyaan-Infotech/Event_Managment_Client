'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ShieldCheck, KeyRound, Loader2, Eye, EyeOff, ChevronRight, Monitor,
    Smartphone, Bell, CheckCircle2, Trash2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

import { useClientProfile, useChangePassword } from '@/hooks/use-client-portal';
import {
    useClientSettings, useUpdateNotifications, useDateFormatter,
} from '@/hooks/use-client-settings';
import { useSessions, useTwoFactor, type ClientSession } from '@/hooks/use-client-security';

/**
 * Security.
 *
 * ── THIS TAB USED TO BE AN APOLOGY ──────────────────────────────────────────
 * It said Active Sessions, Authorized Devices and 2FA were "not merely unbuilt"
 * but impossible, because sign-in issued a stateless JWT that no table recorded.
 * That was true when it was written. `client_sessions` now exists, so all three
 * are real and the apology is gone.
 *
 * ── WHY CHANGE PASSWORD LIVES HERE AND NOT ON ACCOUNT ───────────────────────
 * The supplied designs put it on BOTH tabs. Two editors for one credential is
 * two sets of validation to keep in step, and this codebase has been bitten by
 * that before (§308). It lives here, with the rest of security; Account keeps
 * the details, the email and account closure.
 *
 * ── WHAT THE DESIGN ASKED FOR AND IS NOT HERE ───────────────────────────────
 * "Apps & Integrations" and "API Keys" — there are no OAuth apps and no API-key
 * authentication anywhere in this backend, so both rows would be doors that open
 * onto nothing. "Email alerts for suspicious activity" is absent for the same
 * reason: nothing in this system decides what suspicious means.
 */
export function SecurityTab() {
    const { data: client } = useClientProfile();

    return (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-4">
                <ChangePasswordCard hasPassword={!!client?.has_password} />
                <TwoFactorCard />
                <LoginAlertsCard />
            </div>

            <div className="flex min-w-0 flex-col gap-4">
                <ActiveSessionsCard />
                <OtherOptionsCard />
                <DeleteAccountCard />
            </div>
        </div>
    );
}

/* ── Change password ─────────────────────────────────────────────────────── */

/**
 * ⚠ Changing a password now signs out every OTHER session, and the toast says
 * how many. Until sessions were stored this could not be honoured: the other
 * device kept its stateless token and stayed signed in for up to seven days,
 * which is the opposite of what somebody changing a password wants.
 */
function ChangePasswordCard({ hasPassword }: { hasPassword: boolean }) {
    const change = useChangePassword();
    const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
    const [visible, setVisible] = useState({ current_password: false, new_password: false, confirm: false });

    const mismatch = pw.confirm.length > 0 && pw.new_password !== pw.confirm;
    const canSubmit =
        hasPassword && pw.current_password && pw.new_password.length >= 8 && !mismatch;

    /* The rules the SERVER enforces, ticked off as they are met. */
    const rules = [
        { label: 'At least 8 characters', met: pw.new_password.length >= 8 },
        { label: 'Different from your current password', met: pw.new_password.length > 0 && pw.new_password !== pw.current_password },
        { label: 'Both new passwords match', met: pw.confirm.length > 0 && !mismatch },
    ];

    return (
        <Card className="py-0">
            <CardContent className="p-6">
                <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <KeyRound className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold">Change Password</h2>
                        <p className="mt-0.5 text-[12.5px] break-words text-muted-foreground">
                            We recommend a long, random password that you don&rsquo;t use elsewhere.
                        </p>
                    </div>
                </div>

                {!hasPassword ? (
                    <p className="mt-5 rounded-md border bg-muted/40 p-4 text-[12.5px] text-muted-foreground">
                        This account signs in with Google or Facebook and has no password to change.
                    </p>
                ) : (
                    <div className="mt-5 flex max-w-md flex-col gap-4">
                        <PasswordField
                            label="Current Password" value={pw.current_password}
                            autoComplete="current-password" visible={visible.current_password}
                            onToggle={() => setVisible((v) => ({ ...v, current_password: !v.current_password }))}
                            onChange={(v) => setPw((p) => ({ ...p, current_password: v }))}
                        />
                        <PasswordField
                            label="New Password" value={pw.new_password}
                            autoComplete="new-password" visible={visible.new_password}
                            onToggle={() => setVisible((v) => ({ ...v, new_password: !v.new_password }))}
                            onChange={(v) => setPw((p) => ({ ...p, new_password: v }))}
                        />
                        <PasswordField
                            label="Confirm New Password" value={pw.confirm}
                            autoComplete="new-password" visible={visible.confirm}
                            onToggle={() => setVisible((v) => ({ ...v, confirm: !v.confirm }))}
                            onChange={(v) => setPw((p) => ({ ...p, confirm: v }))}
                        />

                        <div className="rounded-lg border bg-muted/30 p-3.5">
                            <p className="text-[12px] font-medium">Password must:</p>
                            <ul className="mt-2 flex flex-col gap-1.5">
                                {rules.map((r) => (
                                    <li key={r.label} className="flex items-center gap-2 text-[11.5px]">
                                        <CheckCircle2
                                            className={`size-3.5 shrink-0 ${r.met ? 'text-emerald-600' : 'text-muted-foreground/40'}`}
                                        />
                                        <span className={r.met ? '' : 'text-muted-foreground'}>{r.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Said before they press it, not after. */}
                        <p className="text-[11.5px] break-words text-muted-foreground">
                            Changing your password signs you out everywhere else. This device stays
                            signed in.
                        </p>

                        <Button
                            className="self-start"
                            disabled={!canSubmit || change.isPending}
                            onClick={() =>
                                change.mutate(
                                    { current_password: pw.current_password, new_password: pw.new_password },
                                    { onSuccess: () => setPw({ current_password: '', new_password: '', confirm: '' }) },
                                )
                            }
                        >
                            {change.isPending && <Loader2 className="size-4 animate-spin" />}
                            Update Password
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function PasswordField({
    label, value, onChange, visible, onToggle, autoComplete,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    visible: boolean;
    onToggle: () => void;
    autoComplete?: string;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            {/* The eye button is the only positioned child of this wrapper, so it
                measures against the input rather than the label above it. */}
            <div className="relative">
                <Input
                    type={visible ? 'text' : 'password'}
                    value={value}
                    autoComplete={autoComplete}
                    className="pr-10"
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    onClick={onToggle}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                    {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
        </div>
    );
}

/* ── Two-factor ──────────────────────────────────────────────────────────── */

function TwoFactorCard() {
    const { data, isLoading } = useTwoFactor();

    return (
        <Card className="py-0">
            <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                            <ShieldCheck className="size-4" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold">Two-Factor Authentication (2FA)</h2>
                            <p className="mt-0.5 text-[12.5px] break-words text-muted-foreground">
                                Add an extra layer of security using an authenticator app.
                            </p>
                        </div>
                    </div>
                    {isLoading ? (
                        <Skeleton className="h-6 w-20 rounded-full" />
                    ) : data?.is_enabled ? (
                        <Badge className="shrink-0 gap-1 border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="size-3" /> Enabled
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="shrink-0">
                            {data?.is_pending ? 'Setup unfinished' : 'Not enabled'}
                        </Badge>
                    )}
                </div>

                {!isLoading && (
                    <p className="mt-4 text-[12.5px] break-words text-muted-foreground">
                        {data?.is_enabled
                            ? `You are using an authenticator app. ${data.backup_codes_remaining} backup ${data.backup_codes_remaining === 1 ? 'code is' : 'codes are'} unused.`
                            : data?.is_pending
                                ? 'You started setting this up but never entered a code, so it is not on yet.'
                                : 'Scan a QR code with Google Authenticator, Authy or Microsoft Authenticator, and sign-in will ask for a 6-digit code.'}
                    </p>
                )}

                {/* ⚠ Stated because it is true and easy to assume otherwise. The
                    server reports it, so this stops saying it the day the app
                    does implement a challenge. */}
                {data?.covers && !data.covers.mobile_app && data.is_enabled && (
                    <p className="mt-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-[11.5px] break-words text-muted-foreground">
                        {data.covers.note}
                    </p>
                )}

                <Button asChild variant={data?.is_enabled ? 'outline' : 'default'} className="mt-4">
                    <Link href="/dashboard/settings/security/two-factor">
                        {data?.is_enabled ? 'Manage 2FA' : data?.is_pending ? 'Finish setting up' : 'Set up 2FA'}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

/* ── Login alerts ────────────────────────────────────────────────────────── */

/**
 * One switch, not the design's two.
 *
 * "Email alerts for new logins" is real: every sign-in writes a session row, so
 * a new device is an event this system genuinely observes. "Email alerts for
 * suspicious activity" is not — there is no scoring, no impossible-travel check,
 * nothing that decides what suspicious means — so that switch would be wired to
 * a judgement nobody makes.
 */
function LoginAlertsCard() {
    const { data } = useClientSettings();
    const save = useUpdateNotifications();

    const type = data?.notifications.email
        .flatMap((g) => g.types)
        .find((t) => t.type === 'new_login');

    const emailsOff = Boolean(Number(data?.preferences.emails_disabled));
    const deliverable = data?.delivery.email.enabled;

    return (
        <Card className="py-0">
            <CardContent className="p-6">
                <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Bell className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold">Login &amp; Activity Alerts</h2>
                        <p className="mt-0.5 text-[12.5px] break-words text-muted-foreground">
                            Get told about important security events.
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex min-w-0 items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[13px] font-medium">Email alerts for new sign-ins</p>
                        <p className="mt-0.5 text-[11.5px] break-words text-muted-foreground">
                            When your account is signed in to on a new device.
                        </p>
                    </div>
                    {type ? (
                        <Switch
                            checked={type.enabled && !emailsOff}
                            disabled={emailsOff || save.isPending}
                            onCheckedChange={(enabled) =>
                                save.mutate([{ channel: 'email', type: 'new_login', enabled, frequency: type.frequency }])
                            }
                        />
                    ) : (
                        <Skeleton className="h-5 w-9 rounded-full" />
                    )}
                </div>

                {/* The real delivery state, from the server, not an assumption
                    typed in here. It disappears by itself once a provider is
                    configured. */}
                {data && !deliverable && (
                    <p className="mt-4 rounded-md border bg-muted/40 p-3 text-[11.5px] break-words text-muted-foreground">
                        {data.delivery.email.reason}
                    </p>
                )}
                {emailsOff && (
                    <p className="mt-3 text-[11.5px] break-words text-muted-foreground">
                        All email is switched off in Notifications, which overrides this.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

/* ── Right rail ──────────────────────────────────────────────────────────── */

function ActiveSessionsCard() {
    const { data, isLoading } = useSessions();
    const shown = data?.sessions.slice(0, 3) ?? [];

    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Monitor className="size-4" />
                    </span>
                    <h3 className="text-[13.5px] font-semibold">Active Sessions</h3>
                </div>
                <p className="mt-1.5 text-[12px] break-words text-muted-foreground">
                    {isLoading
                        ? 'Checking where you are signed in…'
                        : `You are signed in on ${data?.sessions.length ?? 0} ${data?.sessions.length === 1 ? 'device' : 'devices'}.`}
                </p>

                <div className="mt-4 flex flex-col gap-3">
                    {isLoading
                        ? [0, 1].map((i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
                        : shown.map((s) => <SessionRow key={s.id} session={s} />)}
                </div>

                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                    <Link href="/dashboard/settings/security/sessions">View All Sessions</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

/** Compact row for the rail. The full table lives on the Sessions page. */
function SessionRow({ session }: { session: ClientSession }) {
    const fmt = useDateFormatter();
    const Icon = session.transport === 'app' ? Smartphone : Monitor;

    return (
        <div className="flex min-w-0 items-start gap-2.5">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[12.5px] font-medium break-words">{session.device_name}</p>
                    {session.is_current && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[9.5px]">This device</Badge>
                    )}
                </div>
                {/* The IP, not a city — there is no location service. */}
                <p className="mt-0.5 text-[11px] break-words text-muted-foreground">
                    {session.ip_address ?? 'Unknown IP'} ·{' '}
                    {session.is_current ? 'Active now' : fmt(session.last_active_at, true)}
                </p>
            </div>
        </div>
    );
}

function OtherOptionsCard() {
    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <h3 className="text-[13.5px] font-semibold">Other Security Options</h3>
                <div className="mt-3 flex flex-col">
                    <Link
                        href="/dashboard/settings/security/devices"
                        className="flex items-center gap-3 rounded-md py-2.5 transition-colors hover:bg-muted/50"
                    >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                            <Smartphone className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-[12.5px] font-medium">Authorized Devices</span>
                            <span className="block text-[11px] text-muted-foreground">
                                Manage devices that can stay signed in.
                            </span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                </div>

                {/*
                  ⚠ The design also listed "Apps & Integrations" and "API Keys".
                  Neither exists in any form — no OAuth app can be authorised
                  against this account and there is no API-key authentication
                  anywhere in the backend — so both would be doors onto nothing.
                */}
            </CardContent>
        </Card>
    );
}

function DeleteAccountCard() {
    return (
        <Card className="border-destructive/40 py-0">
            <CardContent className="p-5">
                <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                        <Trash2 className="size-4" />
                    </span>
                    <h3 className="text-[13.5px] font-semibold">Delete Account</h3>
                </div>
                <p className="mt-1.5 text-[12px] break-words text-muted-foreground">
                    Permanently close your account. There is no going back.
                </p>
                <Button asChild variant="outline" size="sm"
                    className="mt-4 w-full border-destructive/50 text-destructive">
                    <Link href="/dashboard/settings/delete-account">Delete Account</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
