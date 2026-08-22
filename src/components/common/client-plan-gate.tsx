'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faTriangleExclamation, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

import { Button } from '@/components/ui/button';
import { WEBSITE_URL } from '@/lib/site';
import { useClientProfile, useLogout } from '@/hooks/use-client-portal';

/**
 * A subscription plan is required to use the portal, and this says so.
 *
 * ── WHAT THIS FIXES ──────────────────────────────────────────────────────────
 * A client with no plan could sign in and reach the dashboard, where every
 * panel was simply empty. Nothing said why. The sidebar's plan card read "No
 * plan assigned" in small print at the very bottom, and the real explanation
 * only appeared if you got as far as opening the Create Event wizard, which
 * returned `reason` from `/client/event-options`. Between those two the portal
 * looked broken rather than un-provisioned.
 *
 * ── IT BLOCKS, RATHER THAN DEGRADING ─────────────────────────────────────────
 * Nothing in this portal works without a plan: the plan decides which event
 * categories, types, religions and menus exist for this client, so with none
 * there is nothing to list and nothing that can be created. The backend already
 * enforces that on WRITE — `validateEventPayload` in `clientEvent.service.js`
 * throws before touching the database when `options.plan` is missing — so this
 * is the same rule stated up front instead of discovered at the end of a form.
 *
 * ── THREE STATES, NOT ONE ────────────────────────────────────────────────────
 * `/client/me` returns the plan joined onto the client, and `getMe` reports a
 * deactivated plan rather than hiding it, precisely so the client can be told
 * why their options vanished. Collapsing these into one "no plan" message would
 * throw that away and send someone to support with the wrong question:
 *
 *   subscription_plan_id NULL         never assigned one
 *   set, but plan is null             the plan row is gone (deleted)
 *   plan present, is_active !== 1     assigned, but the plan was switched off
 *
 * ── SIGN OUT IS ON THIS SCREEN ───────────────────────────────────────────────
 * It replaces the whole shell, header included, so without a sign-out here a
 * blocked client would have no way to leave their own session.
 */
export function ClientPlanGate({ children }: { children: React.ReactNode }) {
    const { data: client } = useClientProfile();
    const logout = useLogout();

    // ClientAuthGate renders nothing until the profile resolves, so this only
    // runs with a client in hand. Guarded anyway rather than assuming the order
    // of two components that could be rearranged later.
    if (!client) return <>{children}</>;

    const plan = client.plan;
    const inactive = !!plan && Number(plan.is_active) !== 1;
    const missing = !plan;

    if (!missing && !inactive) return <>{children}</>;

    // `subscription_plan_id` separates "never had one" from "the plan it pointed
    // at no longer exists" — the same row is returned either way otherwise.
    const deleted = missing && !!client.subscription_plan_id;

    const heading = missing
        ? deleted
            ? 'Your plan is no longer available'
            : 'You do not have a subscription plan'
        : 'Your subscription plan is inactive';

    const detail = missing
        ? deleted
            ? 'The subscription plan on your account has been removed. A plan is required to use the portal, so nothing can be created until a new one is assigned.'
            : 'A subscription plan has not been assigned to your account yet. The plan decides which event types and menus you can use, so the portal cannot be used without one.'
        : `Your plan${plan?.name ? ` (${plan.name})` : ''} has been switched off. It needs to be reactivated, or a different one assigned, before you can continue.`;

    return (
        <div className="grid min-h-screen place-items-center bg-background px-6">
            <div className="w-full max-w-md text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10">
                    <FontAwesomeIcon
                        icon={missing && !deleted ? faCrown : faTriangleExclamation}
                        className="!size-[20px] text-primary"
                    />
                </span>

                <h1 className="mt-4 text-[17px] font-bold text-foreground">{heading}</h1>

                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{detail}</p>

                <p className="mt-4 rounded-md bg-muted px-3 py-2.5 text-[12.5px] text-foreground">
                    Please contact us to have a plan assigned to your account.
                </p>

                <div className="mt-5 flex flex-col gap-2">
                    {/* Only offered when the website is actually configured. A
                        guessed domain is what put `localhost:3005` in front of a
                        production user once already. */}
                    {WEBSITE_URL ? (
                        <Button asChild className="w-full">
                            <a href={WEBSITE_URL}>Go to the website</a>
                        </Button>
                    ) : null}

                    <Button
                        variant="outline"
                        className="w-full"
                        disabled={logout.isPending}
                        onClick={() => logout.mutate()}
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} className="!size-[13px]" />
                        {logout.isPending ? 'Signing out…' : 'Sign out'}
                    </Button>
                </div>

                <p className="mt-4 text-[11.5px] text-muted-foreground">
                    Signed in as {client.email}
                </p>
            </div>
        </div>
    );
}
