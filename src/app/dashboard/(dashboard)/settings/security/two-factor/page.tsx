'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
    ArrowLeft, ShieldCheck, Copy, Check, Loader2, Download, Info, KeyRound,
    Smartphone, TriangleAlert, CheckCircle2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { useClientProfile } from '@/hooks/use-client-portal';
import {
    useTwoFactor, useSetupTwoFactor, useConfirmTwoFactor, useDisableTwoFactor,
    useRegenerateBackupCodes,
} from '@/hooks/use-client-security';

/**
 * Manage Two-Factor Authentication.
 *
 * ── THE QR IS DRAWN HERE, NOT ON THE SERVER ─────────────────────────────────
 * The API returns the `otpauth://` URI; this renders it with `qrcode.react`,
 * which the portal already depends on. A PNG generated in the backend would mean
 * the secret travelling as an image nobody can inspect, and a QR library in a
 * backend with no other use for one.
 *
 * ── ENROLMENT IS TWO STEPS, AND THE SCREEN CANNOT SKIP THE SECOND ───────────
 * `setup` hands back a secret; 2FA is NOT on until a code from the authenticator
 * proves the QR was really scanned. That is the server's rule, not this
 * component's, so closing this tab halfway leaves the account exactly as it was.
 *
 * ── BACKUP CODES ARE SHOWN ONCE, AND THE SCREEN SAYS SO ─────────────────────
 * They are stored hashed, so there is no "show them again". The dialog they
 * appear in cannot be dismissed by clicking away — losing them behind a stray
 * click is precisely the accident this protects against.
 */
export default function TwoFactorPage() {
    const { data: client } = useClientProfile();
    const { data: status, isLoading } = useTwoFactor();

    const setup = useSetupTwoFactor();
    const confirm = useConfirmTwoFactor();
    const regenerate = useRegenerateBackupCodes();

    const [code, setCode] = useState('');
    // Opt-in, not opt-out: trust is a 30-day standing exemption from the code,
    // survives logout, and should be something somebody notices choosing —
    // not something that happens unless they notice and uncheck a box.
    const [trustDevice, setTrustDevice] = useState(false);
    const [codes, setCodes] = useState<string[] | null>(null);
    const [disableOpen, setDisableOpen] = useState(false);

    const enabled = Boolean(status?.is_enabled);
    const secret = setup.data?.secret ?? null;

    return (
        <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <Button asChild variant="link" size="sm" className="h-auto w-fit p-0 text-[12.5px]">
                        <Link href="/dashboard/settings?tab=security">
                            <ArrowLeft className="size-3.5" /> Back to Security
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Two-Factor Authentication (2FA)
                    </h1>
                    <p className="text-sm break-words text-muted-foreground">
                        Add an extra layer of security to your account. Once enabled, you will need a
                        verification code in addition to your password to sign in.
                    </p>
                </div>
                {isLoading ? <Skeleton className="h-7 w-28 rounded-full" /> : enabled ? (
                    <Badge className="shrink-0 gap-1 border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> 2FA is Enabled
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="shrink-0">Not enabled</Badge>
                )}
            </div>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex min-w-0 flex-col gap-5">
                    {isLoading ? (
                        <Skeleton className="h-80 w-full rounded-xl" />
                    ) : enabled ? (
                        <EnabledPanel
                            remaining={status?.backup_codes_remaining ?? 0}
                            onRegenerate={() =>
                                regenerate.mutate(undefined, { onSuccess: (r) => setCodes(r.codes) })}
                            regenerating={regenerate.isPending}
                        />
                    ) : (
                        <SetupPanel
                            email={client?.email ?? ''}
                            secret={secret}
                            otpauth={setup.data?.otpauth_url ?? null}
                            pending={status?.is_pending ?? false}
                            starting={setup.isPending}
                            onStart={() => setup.mutate()}
                            code={code}
                            onCode={setCode}
                            trustDevice={trustDevice}
                            onTrustDevice={setTrustDevice}
                            confirming={confirm.isPending}
                            onConfirm={() =>
                                confirm.mutate({ code, trustDevice }, {
                                    onSuccess: (r) => { setCodes(r.codes); setCode(''); },
                                })}
                        />
                    )}

                    <Card className="py-0">
                        <CardContent className="flex min-w-0 items-start gap-3 p-5">
                            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <p className="min-w-0 text-[12px] break-words text-muted-foreground">
                                <span className="font-medium text-foreground">Need help?</span>{' '}
                                Two-factor authentication works with Google Authenticator, Authy and
                                Microsoft Authenticator. Any of them will do — they all read the same
                                QR code, and none of them needs an account or an internet connection
                                to generate codes.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                    <AboutCard />
                    {enabled && (
                        <Card className="border-destructive/40 py-0">
                            <CardContent className="p-5">
                                <Button
                                    variant="outline"
                                    className="w-full border-destructive/50 text-destructive"
                                    onClick={() => setDisableOpen(true)}
                                >
                                    <TriangleAlert className="size-4" /> Disable 2FA
                                </Button>
                                <p className="mt-2.5 text-[11.5px] break-words text-muted-foreground">
                                    Disabling 2FA will make your account less secure.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <BackupCodesDialog codes={codes} onClose={() => setCodes(null)} />
            <DisableDialog
                open={disableOpen}
                onOpenChange={setDisableOpen}
                hasPassword={Boolean(client?.has_password)}
            />
        </div>
    );
}

/* ── Setup ───────────────────────────────────────────────────────────────── */

function SetupPanel({
    email, secret, otpauth, pending, starting, onStart,
    code, onCode, trustDevice, onTrustDevice, confirming, onConfirm,
}: {
    email: string;
    secret: string | null;
    otpauth: string | null;
    pending: boolean;
    starting: boolean;
    onStart: () => void;
    code: string;
    onCode: (v: string) => void;
    trustDevice: boolean;
    onTrustDevice: (v: boolean) => void;
    confirming: boolean;
    onConfirm: () => void;
}) {
    const [copied, setCopied] = useState(false);

    const copySecret = async () => {
        if (!secret) return;
        try {
            await navigator.clipboard.writeText(secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard can be blocked. The key is on screen to be typed anyway.
        }
    };

    if (!otpauth) {
        return (
            <Card className="py-0">
                <CardContent className="p-6">
                    <h2 className="text-base font-semibold">Set up your authenticator app</h2>
                    <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                        {pending
                            ? 'You started this before but never entered a code, so 2FA is still off. Continue to scan the code again.'
                            : 'You will scan a QR code with an authenticator app, then enter the 6-digit code it shows.'}
                    </p>
                    <Button className="mt-5" disabled={starting} onClick={onStart}>
                        {starting && <Loader2 className="size-4 animate-spin" />}
                        {pending ? 'Continue setup' : 'Begin setup'}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="py-0">
            <CardContent className="p-6">
                {/* 1 — the QR */}
                <h2 className="text-base font-semibold">1. Your Authenticator App</h2>
                <p className="mt-1 text-[12.5px] break-words text-muted-foreground">
                    Use an authenticator app (Google Authenticator, Authy, Microsoft Authenticator)
                    to scan the QR code.
                </p>

                <div className="mt-4 flex flex-col gap-5 sm:flex-row">
                    {/* White plate regardless of theme: a dark-on-dark QR does not
                        scan, and the contrast the reader needs is not negotiable. */}
                    <div className="grid shrink-0 place-items-center self-start rounded-xl border bg-white p-3">
                        <QRCodeSVG value={otpauth} size={148} level="M" />
                    </div>

                    <div className="min-w-0 flex-1 rounded-lg border bg-muted/30 p-4">
                        <p className="text-[12.5px] font-medium">Can&rsquo;t scan the QR code?</p>
                        <p className="mt-1 text-[11.5px] break-words text-muted-foreground">
                            Enter this key manually in your authenticator app.
                        </p>
                        <div className="mt-3 rounded-md border bg-background px-3 py-2">
                            <code className="text-[12px] font-semibold tracking-wider break-all">
                                {secret}
                            </code>
                        </div>
                        <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-[11.5px]"
                            onClick={copySecret}>
                            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                        {email && (
                            <p className="mt-2 text-[11px] break-words text-muted-foreground">
                                It will appear in your app as {email}.
                            </p>
                        )}
                    </div>
                </div>

                {/* 2 — prove it was scanned */}
                <h2 className="mt-7 text-base font-semibold">2. Verify Code</h2>
                <p className="mt-1 text-[12.5px] break-words text-muted-foreground">
                    Enter the 6-digit code generated by your authenticator app.
                </p>

                <div className="mt-3 flex max-w-xs flex-col gap-3">
                    <div className="relative">
                        <ShieldCheck className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={code}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="Enter 6-digit code"
                            className="pl-9 tracking-[0.3em]"
                            // Digits only, capped at six: the server accepts nothing
                            // else, so letting them be typed only delays the refusal.
                            onChange={(e) => onCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            onKeyDown={(e) => { if (e.key === 'Enter' && code.length === 6) onConfirm(); }}
                        />
                    </div>

                    <label className="flex min-w-0 items-start gap-2.5">
                        <Checkbox
                            checked={trustDevice}
                            onCheckedChange={(v) => onTrustDevice(v === true)}
                            className="mt-0.5"
                        />
                        <span className="min-w-0">
                            <span className="block text-[12px] font-medium">
                                Trust this device for 30 days
                            </span>
                            <span className="block text-[11px] break-words text-muted-foreground">
                                This browser will not ask for a code again until then.
                            </span>
                        </span>
                    </label>

                    <Button
                        className="self-start"
                        disabled={code.length !== 6 || confirming}
                        onClick={onConfirm}
                    >
                        {confirming && <Loader2 className="size-4 animate-spin" />}
                        Verify &amp; Enable
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

/* ── Enabled ─────────────────────────────────────────────────────────────── */

function EnabledPanel({
    remaining, onRegenerate, regenerating,
}: { remaining: number; onRegenerate: () => void; regenerating: boolean }) {
    return (
        <Card className="py-0">
            <CardContent className="p-6">
                <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/15">
                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold">Two-factor authentication is on</h2>
                        <p className="mt-0.5 text-[12.5px] break-words text-muted-foreground">
                            You are using an authenticator app as your second factor.
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-[14px] font-semibold">Backup Codes</h3>
                    <p className="mt-1 text-[12.5px] break-words text-muted-foreground">
                        Use a backup code to sign in if you cannot reach your authenticator app. Each
                        one works exactly once.
                    </p>

                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-4">
                        <span className="text-[13px] font-semibold">
                            {remaining} unused {remaining === 1 ? 'code' : 'codes'}
                        </span>
                        {remaining === 0 && (
                            <Badge variant="destructive" className="h-5 text-[10px]">All used</Badge>
                        )}
                        {remaining > 0 && remaining <= 3 && (
                            <Badge className="h-5 border-warning/40 bg-warning/15 text-[10px] text-warning">
                                Running low
                            </Badge>
                        )}
                    </div>

                    {/*
                      Said plainly, because it is the question this screen gets
                      asked: the codes are hashed, so there is no "show them
                      again" to build — only a new set.
                    */}
                    <p className="mt-3 text-[11.5px] break-words text-muted-foreground">
                        Your existing codes cannot be shown again — they are stored hashed. Generating
                        a new set replaces every one of them.
                    </p>

                    <Button variant="outline" className="mt-3" disabled={regenerating} onClick={onRegenerate}>
                        {regenerating && <Loader2 className="size-4 animate-spin" />}
                        Generate new backup codes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

/* ── Backup codes ────────────────────────────────────────────────────────── */

/**
 * Shown once. Deliberately NOT dismissible by clicking outside — losing these
 * behind a stray click is the exact accident worth preventing, because there is
 * no way to show them again.
 */
function BackupCodesDialog({ codes, onClose }: { codes: string[] | null; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    const copyAll = async () => {
        if (!codes) return;
        try {
            await navigator.clipboard.writeText(codes.join('\n'));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Blocked clipboard. They are on screen and can be written down.
        }
    };

    /*
      A Blob and an object URL rather than a data: URI — a viewer's browser is
      more willing to save one, and it is revoked immediately afterwards so the
      page does not leak the codes into memory it no longer needs.
    */
    const download = () => {
        if (!codes) return;
        const body = [
            'Event Invit — two-factor backup codes',
            `Generated ${new Date().toLocaleString()}`,
            '',
            'Each code works once. Keep them somewhere safe and private.',
            '',
            ...codes,
        ].join('\n');
        const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'event-invit-backup-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={!!codes} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                className="sm:max-w-lg"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Save your backup codes</DialogTitle>
                    <DialogDescription>
                        Store these somewhere safe. Each code signs you in once if you cannot reach
                        your authenticator app. They are stored hashed, so this is the only time they
                        can be shown.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-4">
                    {codes?.map((c) => (
                        <code key={c} className="text-[12.5px] font-semibold tracking-wider break-all">
                            {c}
                        </code>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={download}>
                        <Download className="size-3.5" /> Download Codes
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyAll}>
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copied ? 'Copied' : 'Copy All'}
                    </Button>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>I have saved them</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ── Disable ─────────────────────────────────────────────────────────────── */

/**
 * Turning 2FA off requires proving identity NOW — a password or a current code.
 * Without that, anybody who finds an unlocked laptop can remove the protection
 * that laptop was supposed to need. A social-only account has no password, so it
 * can only offer a code; the server decides which it accepts.
 */
function DisableDialog({
    open, onOpenChange, hasPassword,
}: { open: boolean; onOpenChange: (v: boolean) => void; hasPassword: boolean }) {
    const disable = useDisableTwoFactor();
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');

    const canSubmit = (hasPassword && password.length > 0) || code.length >= 6;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Turn off two-factor authentication?</DialogTitle>
                    <DialogDescription>
                        Your account will be protected by your password alone. Your backup codes will
                        be deleted.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    {hasPassword && (
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground">Current password</Label>
                            <Input
                                type="password"
                                value={password}
                                autoComplete="current-password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">
                            {hasPassword ? 'Or a code from your authenticator app' : 'Code from your authenticator app'}
                        </Label>
                        <Input
                            value={code}
                            inputMode="numeric"
                            placeholder="6-digit code or a backup code"
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        variant="destructive"
                        disabled={!canSubmit || disable.isPending}
                        onClick={() =>
                            disable.mutate(
                                { ...(password ? { password } : {}), ...(code ? { code } : {}) },
                                {
                                    onSuccess: () => {
                                        setPassword(''); setCode(''); onOpenChange(false);
                                    },
                                },
                            )}
                    >
                        {disable.isPending && <Loader2 className="size-4 animate-spin" />}
                        Disable 2FA
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ── Rail ────────────────────────────────────────────────────────────────── */

function AboutCard() {
    const { data: status } = useTwoFactor();

    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10">
                        <ShieldCheck className="size-4 text-primary" />
                    </span>
                    <h3 className="text-[13.5px] font-semibold">About Two-Factor Authentication</h3>
                </div>
                <p className="mt-2.5 text-[12px] break-words text-muted-foreground">
                    2FA helps protect your account by requiring a second verification step when you
                    sign in.
                </p>

                <div className="mt-4 flex flex-col gap-3.5">
                    {[
                        {
                            icon: <ShieldCheck className="size-4 text-emerald-600" />, tone: 'bg-emerald-500/10',
                            title: 'Stronger Security',
                            body: 'Helps prevent unauthorised access even if your password is compromised.',
                        },
                        {
                            icon: <KeyRound className="size-4 text-violet-600" />, tone: 'bg-violet-500/10',
                            title: 'Required on New Devices',
                            body: 'You will need a code when signing in on a new device or browser.',
                        },
                        {
                            icon: <Download className="size-4 text-amber-600" />, tone: 'bg-amber-500/10',
                            title: 'Backup Codes',
                            body: 'Use backup codes to sign in if you cannot reach your authenticator app.',
                        },
                    ].map((t) => (
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

                {/*
                  ⚠ The one caveat this screen must not omit, and it comes from
                  the SERVER — the day the app implements a challenge, this
                  disappears without anybody editing this file.
                */}
                {status?.covers && !status.covers.mobile_app && (
                    <div className="mt-4 flex min-w-0 items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
                        <Smartphone className="mt-0.5 size-3.5 shrink-0 text-warning" />
                        <p className="min-w-0 text-[11px] break-words text-muted-foreground">
                            {status.covers.note}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
