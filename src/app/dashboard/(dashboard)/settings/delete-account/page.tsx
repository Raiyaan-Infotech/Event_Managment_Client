'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Eye, EyeOff, Loader2, Trash2, TriangleAlert, XCircle, Info, ShieldCheck,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

import { useClientProfile, useDeleteAccount } from '@/hooks/use-client-portal';

/**
 * Delete Account.
 *
 * ── THE DESIGN'S "WHAT WILL BE DELETED?" LIST IS NOT WHAT HAPPENS ───────────
 * It promised five things: events/guests/RSVP data, templates and designs,
 * settings and integrations, billing history and payment information, and team
 * members. `deleteMyAccount` does exactly ONE thing — it soft-deletes the
 * `website_clients` row and frees the email address. Nothing cascades. The
 * events, guests, invoices and uploaded images all stay exactly where they are.
 *
 * Printing that list would be a promise of erasure the system does not perform,
 * on the one screen where somebody might be deleting their account BECAUSE they
 * want their data gone. So the panel is split in two — what actually happens,
 * and what is deliberately kept — and it names the way to ask for the rest.
 *
 * ── WHY THE SUCCESS SCREEN IS NOT IN THIS ROUTE ─────────────────────────────
 * The moment the account closes, the server clears the session cookies. Every
 * page under /dashboard sits inside ClientAuthGate, which reads `/client/me`,
 * takes the 401 as "not signed in" and redirects to the tenant WEBSITE's login
 * page. A confirmation rendered here would be pulled out from under the reader
 * on the gate's next refetch — and the previous behaviour (`router.replace('/')`)
 * was worse still: `/` redirects to `/dashboard`, so closing an account bounced
 * straight out to a login screen with no confirmation at all.
 *
 * /account-deleted lives OUTSIDE the dashboard tree and needs no session.
 */

export default function DeleteAccountPage() {
    const { data: client } = useClientProfile();
    const del = useDeleteAccount();

    const [password, setPassword] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [understood, setUnderstood] = useState(false);

    /*
      A social-only client has no password to be asked for (nullable column, by
      design — see the OAuth flow). They re-type their email instead. The SERVER
      decides which it requires; this only decides which field to show, so a
      wrong guess here cannot weaken the check.
    */
    const hasPassword = Boolean(client?.has_password);
    const identityGiven = hasPassword ? password.length > 0 : confirmEmail.trim().length > 0;
    const canSubmit = understood && identityGiven && !del.isPending;

    function submit() {
        if (!canSubmit) return;
        del.mutate(
            hasPassword ? { password } : { confirm_email: confirmEmail },
            {
                /*
                  A FULL navigation, not router.push. A soft one keeps the React
                  tree and the React Query cache alive, so the dashboard layout's
                  auth gate stays mounted with a profile query that will 401 on
                  its next refetch and redirect off-site. A hard load tears all
                  of it down. `replace` so Back cannot return to a form whose
                  session no longer exists.
                */
                onSuccess: () => window.location.replace('/account-deleted'),
            },
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-1">
                <Button asChild variant="link" size="sm" className="h-auto w-fit p-0 text-[12.5px]">
                    <Link href="/dashboard/settings">
                        <ArrowLeft className="size-3.5" /> Back to Settings
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">Delete Account</h1>
                <p className="text-sm break-words text-muted-foreground">
                    We&rsquo;re sorry to see you go. Please read the information below carefully
                    before confirming.
                </p>
            </div>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                <Card className="min-w-0 border-destructive/40 py-0">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10">
                                <Trash2 className="size-[18px] text-destructive" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold">Delete Your Account</h2>
                                <p className="mt-1 text-[12.5px] break-words text-muted-foreground">
                                    This closes your account for good. You will be signed out at once
                                    and will not be able to sign in again.
                                </p>
                            </div>
                        </div>

                        {/* WHAT ACTUALLY HAPPENS — every line here is something the
                            endpoint really does. */}
                        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                            <p className="text-[13px] font-semibold text-destructive">
                                What happens when you delete
                            </p>
                            <ul className="mt-3 flex flex-col gap-2">
                                <Consequence>You are signed out immediately, on every device.</Consequence>
                                <Consequence>
                                    You lose access to your events, guests, RSVPs and invitation
                                    designs through this portal.
                                </Consequence>
                                <Consequence>Your subscription plan stops being yours to manage.</Consequence>
                                <Consequence>
                                    Your email address is released, so it can be used to sign up
                                    again later as a new account.
                                </Consequence>
                            </ul>
                        </div>

                        {/*
                          ⚠ The honest counterpart. Somebody closing an account to
                          get their data removed needs to know this BEFORE they
                          click, not after they write in and ask.
                        */}
                        <div className="mt-3 rounded-lg border bg-muted/40 p-4">
                            <p className="flex items-center gap-2 text-[13px] font-semibold">
                                <Info className="size-3.5 shrink-0 text-muted-foreground" />
                                What is not removed
                            </p>
                            <p className="mt-2 text-[12.5px] break-words text-muted-foreground">
                                Your event, guest and RSVP records stay in the system, as do any
                                invoices and billing history, which are kept for accounting. Images
                                you uploaded are not erased either. If you need all of it deleted
                                rather than closed, contact us before deleting — this screen cannot
                                do it, and afterwards you will have no account to ask from.
                            </p>
                        </div>

                        <Separator className="my-6" />

                        <p className="text-[13px] font-medium">
                            To continue, please confirm your identity.
                        </p>

                        {hasPassword ? (
                            <div className="mt-4 max-w-md">
                                <Label htmlFor="delete-password" className="text-[12.5px]">
                                    Enter your password
                                </Label>
                                {/*
                                  The eye button sits OUTSIDE nothing — the input is
                                  the only positioned child of this wrapper, so the
                                  absolute button measures against it and not against
                                  the label above.
                                */}
                                <div className="relative mt-1.5">
                                    <Input
                                        id="delete-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        autoComplete="current-password"
                                        placeholder="Your password"
                                        className="pr-10"
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 max-w-md">
                                <Label htmlFor="delete-confirm-email" className="text-[12.5px]">
                                    Type your email address to confirm
                                </Label>
                                <Input
                                    id="delete-confirm-email"
                                    className="mt-1.5"
                                    value={confirmEmail}
                                    autoComplete="off"
                                    placeholder={client?.email ?? 'you@example.com'}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                                />
                                <p className="mt-1.5 text-[11.5px] break-words text-muted-foreground">
                                    This account signs in with Google or Facebook and has no
                                    password, so your email address is the confirmation.
                                </p>
                            </div>
                        )}

                        <label className="mt-5 flex max-w-md cursor-pointer items-start gap-2.5">
                            <Checkbox
                                checked={understood}
                                onCheckedChange={(v) => setUnderstood(v === true)}
                                className="mt-0.5"
                            />
                            <span className="text-[12.5px] break-words text-muted-foreground">
                                I understand that my account will be closed, that I will lose access
                                to it, and that this cannot be undone from here.
                            </span>
                        </label>

                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <Button variant="destructive" disabled={!canSubmit} onClick={submit}>
                                {del.isPending
                                    ? <Loader2 className="size-4 animate-spin" />
                                    : <Trash2 className="size-4" />}
                                Permanently Delete Account
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/settings">Cancel</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex min-w-0 flex-col gap-4">
                    <Card className="py-0">
                        <CardContent className="p-6">
                            <span className="grid size-9 place-items-center rounded-full bg-warning/15">
                                <TriangleAlert className="size-[17px] text-warning" />
                            </span>
                            <h2 className="mt-3 text-[13.5px] font-semibold">Before you go</h2>
                            <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                                If you only wanted to stop the emails or change your plan, you do not
                                need to delete anything.
                            </p>
                            <div className="mt-4 flex flex-col gap-2">
                                <Button asChild variant="outline" size="sm" className="justify-start">
                                    <Link href="/dashboard/billing">Change or cancel your plan</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="justify-start">
                                    <Link href="/dashboard/billing/contact-sales">Talk to us first</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="py-0">
                        <CardContent className="p-6">
                            <span className="grid size-9 place-items-center rounded-full bg-primary/10">
                                <ShieldCheck className="size-[17px] text-primary" />
                            </span>
                            <h2 className="mt-3 text-[13.5px] font-semibold">
                                Why we ask again
                            </h2>
                            <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                                You are already signed in, but a session can be a borrowed laptop or
                                a tab left open. This is the one action in the portal that cannot be
                                undone here, so it asks for something only you know.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Consequence({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-2 text-[12.5px] break-words text-foreground/80">
            <XCircle className="mt-[1px] size-3.5 shrink-0 text-destructive" />
            <span className="min-w-0">{children}</span>
        </li>
    );
}
