'use client';

import { CheckCircle2, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WEBSITE_URL, isSiteConfigured, signupUrl } from '@/lib/site';

/**
 * "Your account has been closed."
 *
 * ── WHY THIS IS NOT UNDER /dashboard ────────────────────────────────────────
 * By the time anyone reads this, the session cookies are gone. Every route in
 * the dashboard tree sits inside ClientAuthGate, which reads `/client/me`,
 * takes the 401 as "not signed in" and redirects to the tenant WEBSITE's login
 * page — so a confirmation rendered in there would be pulled away the moment
 * the gate refetched. This route needs no session and reads nothing.
 *
 * It is reached by a FULL page load from the delete form, which also tears down
 * the React Query cache that would otherwise still hold the deleted profile.
 *
 * ── WHAT IT DOES NOT CLAIM ──────────────────────────────────────────────────
 * The supplied design said "all associated data have been deleted". That is not
 * what happened: `deleteMyAccount` soft-deletes the client row and frees the
 * email, and nothing cascades — events, guests, invoices and uploads all
 * remain. The wording here matches the deletion that actually ran.
 *
 * Its "Contact Support" button is also absent, and deliberately: there is no
 * support mailbox anywhere in this system, and inventing one sends people into
 * a void (the §323 reasoning for not printing a sales@ address). The website is
 * the one place that really does carry the tenant's contact details, and it is
 * only offered when NEXT_PUBLIC_SITE_URL is actually configured.
 */

export default function AccountDeletedPage() {
    return (
        <div className="grid min-h-screen place-items-center bg-background px-6 py-10">
            <Card className="w-full max-w-lg py-0">
                <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">
                    <span className="grid size-14 place-items-center rounded-full bg-emerald-500/15">
                        <CheckCircle2 className="size-7 text-emerald-500" />
                    </span>

                    <h1 className="mt-4 text-xl font-semibold">Your account has been closed</h1>
                    <p className="mt-2 max-w-sm text-[12.5px] break-words text-muted-foreground">
                        You have been signed out and you will not be able to sign in with this
                        account again.
                    </p>

                    <div className="mt-6 w-full rounded-lg border bg-muted/40 p-4 text-left">
                        <p className="text-[13px] font-semibold">What happened</p>
                        <ul className="mt-3 flex flex-col gap-2">
                            <Done>Your account was closed and your session ended.</Done>
                            <Done>You no longer have access to the client portal.</Done>
                            {/*
                              Stated plainly rather than buried. Somebody who closed
                              their account to have their data removed has to learn
                              this here, not weeks later.
                            */}
                            <Done>
                                Your events, guests and billing records were kept — closing an
                                account does not erase them.
                            </Done>
                            <Done>
                                Your email address was released, so you can sign up again with it.
                            </Done>
                        </ul>
                    </div>

                    {isSiteConfigured && (
                        <>
                            <Separator className="my-6" />
                            <p className="text-[13px] font-semibold">Changed your mind?</p>
                            <p className="mt-1.5 max-w-sm text-[12.5px] break-words text-muted-foreground">
                                You can create a new account at any time, and the website carries the
                                contact details if you need to reach somebody about the records that
                                were kept.
                            </p>
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                <Button asChild size="sm">
                                    <a href={signupUrl() ?? WEBSITE_URL!}>Create a new account</a>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                    <a href={WEBSITE_URL!}>
                                        Go to the website <ExternalLink className="size-3.5" />
                                    </a>
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Done({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-2 text-[12.5px] break-words text-foreground/80">
            <CheckCircle2 className="mt-[1px] size-3.5 shrink-0 text-emerald-500" />
            <span className="min-w-0">{children}</span>
        </li>
    );
}
