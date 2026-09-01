'use client';

import Link from 'next/link';
import {
    ShieldCheck, Lock, KeyRound, MonitorSmartphone, Settings2, ArrowRight,
    Palette, Mail, Megaphone, BellRing, Zap, Download, FileDown, Trash2,
    CalendarDays, MapPin, Users, Send, Crown, ChevronRight, BadgeCheck,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileAvatar } from '@/components/common/profile-avatar';
import { useClientProfile } from '@/hooks/use-client-portal';
import { useDateFormatter } from '@/hooks/use-client-settings';
import { useDashboardStats } from '@/hooks/use-client-events';
import { useGuestStats } from '@/hooks/use-guests';

/**
 * My Profile — a READ view of the account, with editing delegated to Settings.
 *
 * ── WHY THE EDIT BUTTONS LINK RATHER THAN OPEN INLINE EDITORS ───────────────
 * Settings > Profile already owns the form, the validation and the save. A
 * second editor here would be a second place for the same three fields to
 * diverge, and the first symptom of that is a field saving on one screen and
 * not the other. Each Edit is a link to the tab that owns it.
 *
 * ── WHAT IS REAL ────────────────────────────────────────────────────────────
 * Name, email, phone, bio, avatar, plan, member-since and the verified badge
 * come from `/client/me`. Events Created is a real count; Guests Added is a
 * real count that genuinely reads 0 for a client with no guests yet.
 *
 * ── WHAT IS NOT, AND SAYS SO ────────────────────────────────────────────────
 * Location, Time Zone and Language have no columns. Emails Sent has no source —
 * the messaging module is paused by decision. "/ Unlimited" has no source
 * either: a plan carries a price, a billing cycle and trial days, but no usage
 * ceiling of any kind. Preferences, 2FA and Active Sessions have no schema.
 *
 * Each of those renders an em dash or a stated absence rather than a plausible
 * number. On a usage panel especially, an invented ceiling is the kind somebody
 * plans around.
 */
export default function ProfilePage() {
    const { isLoading } = useClientProfile();

    if (isLoading) return <ProfileSkeleton />;

    return (
        <div className="flex flex-col gap-6">
            <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    View and manage your account information.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="flex flex-col gap-6">
                    <HeaderCard />
                    <AccountInformation />
                    <PlanAndUsage />
                </div>

                <div className="flex flex-col gap-6">
                    <AccountSecurity />
                    <PreferencesCard />
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}

/* ── Header ──────────────────────────────────────────────────────────────── */

function HeaderCard() {
    const fmt = useDateFormatter();
    const { data: client } = useClientProfile();
    const verified = !!Number(client?.email_verified);

    return (
        <Card className="py-0">
            <CardContent className="flex flex-col gap-5 p-6 sm:flex-row">
                <ProfileAvatar client={client ?? null} size={112} />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-bold">{client?.name || '—'}</h2>
                                {client?.plan?.name && (
                                    <Badge variant="secondary">{client.plan.name}</Badge>
                                )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-muted-foreground break-all">
                                    {client?.email}
                                </span>
                                {/* Reports the real flag. It reads "Not verified"
                                    today because nothing verifies an address yet —
                                    a green tick here would be decoration. */}
                                <Badge
                                    variant={verified ? 'default' : 'secondary'}
                                    className={verified ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15' : ''}
                                >
                                    {verified ? <BadgeCheck className="size-3" /> : null}
                                    {verified ? 'Verified' : 'Not verified'}
                                </Badge>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/settings">Edit Profile</Link>
                        </Button>
                    </div>

                    {client?.bio && (
                        <p className="mt-3 max-w-prose text-sm text-muted-foreground">{client.bio}</p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
                        <Fact icon={<CalendarDays className="size-4" />} label="Member since"
                            value={fmt(client?.created_at)} />
                        {/* ⚠ NO COLUMN. `website_clients` has no location of any
                            kind — not city, country or coordinates. */}
                        <Fact icon={<MapPin className="size-4" />} label="Location" value="—" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </span>
            <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{label}</span>
                <span className="block text-sm font-semibold">{value}</span>
            </span>
        </div>
    );
}

/* ── Account information ─────────────────────────────────────────────────── */

function AccountInformation() {
    const { data: client } = useClientProfile();

    const rows: { label: string; value: string; editable: boolean; note?: string }[] = [
        { label: 'Full Name', value: client?.name || '—', editable: true },
        { label: 'Email Address', value: client?.email || '—', editable: true },
        {
            label: 'Phone Number',
            value: client?.mobile ? `${client.dial_code ?? ''} ${client.mobile}`.trim() : '—',
            editable: true,
        },
        // ⚠ NEITHER HAS A COLUMN. Shown so the screen matches the design and the
        // gap is visible, but not made editable — an Edit button leading to a
        // field that cannot save is worse than no button.
        { label: 'Time Zone', value: '—', editable: false, note: 'Not stored yet' },
        { label: 'Language', value: '—', editable: false, note: 'Not stored yet' },
    ];

    return (
        <Card className="py-0">
            <CardContent className="p-6">
                <SectionTitle icon={<Users className="size-4" />} title="Account Information" />

                <div className="mt-5 flex flex-col">
                    {rows.map((row, i) => (
                        <div key={row.label}>
                            {i > 0 && <Separator />}
                            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium">{row.label}</span>
                                    <span className="block text-sm text-muted-foreground break-all">
                                        {row.value}
                                    </span>
                                </span>
                                {row.editable ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/dashboard/settings">Edit</Link>
                                    </Button>
                                ) : (
                                    <Badge variant="secondary" className="text-[10px]">{row.note}</Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/* ── Plan & usage ────────────────────────────────────────────────────────── */

function PlanAndUsage() {
    const { data: client } = useClientProfile();
    const events = useDashboardStats();
    const guests = useGuestStats();

    return (
        <Card className="py-0">
            <CardContent className="p-6">
                <SectionTitle icon={<Crown className="size-4" />} title="Plan & Usage" />

                <div className="mt-5 grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Current Plan</p>
                        <p className="mt-1 text-lg font-bold text-primary break-words">
                            {client?.plan?.name ?? 'No plan assigned'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {client?.plan?.short_description ?? 'Contact us to have a plan added to your account.'}
                        </p>
                        {/* No billing or checkout exists, so this cannot lead
                            anywhere. Disabled rather than pointed at a dead route. */}
                        <Button variant="outline" size="sm" disabled className="mt-3"
                            title="Billing is not available yet">
                            Upgrade Plan
                        </Button>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3">
                        <Usage
                            icon={<CalendarDays className="size-4" />}
                            label="Events Created"
                            value={events.data?.total_events}
                            tint="bg-primary"
                        />
                        <Usage
                            icon={<Users className="size-4" />}
                            label="Guests Added"
                            value={guests.data?.total_guests}
                            tint="bg-emerald-500"
                        />
                        {/* ⚠ NO SOURCE. The messaging module is paused by
                            decision — nothing has ever been sent, and there is no
                            counter to read. */}
                        <Usage
                            icon={<Send className="size-4" />}
                            label="Emails Sent"
                            value={undefined}
                            tint="bg-amber-500"
                            unavailable
                        />
                    </div>
                </div>

                <p className="mt-5 text-xs text-muted-foreground">
                    Usage limits are not shown because a plan does not carry any — it has a price,
                    a billing cycle and trial days, but no ceiling on events, guests or messages.
                </p>
            </CardContent>
        </Card>
    );
}

/**
 * One usage figure.
 *
 * The design pairs each with "/ Unlimited" and a progress bar. Neither is
 * rendered: there is no limit field anywhere, so the denominator would be
 * invented and the bar would be a fraction of a number that does not exist. The
 * count alone is true; a bar implies a ceiling.
 */
function Usage({
    icon, label, value, tint, unavailable,
}: {
    icon: React.ReactNode; label: string; value?: number; tint: string; unavailable?: boolean;
}) {
    return (
        <div className="min-w-0">
            <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                {icon}
            </span>
            {/* A div, not a paragraph. Skeleton renders a div, and a div inside
                a paragraph is invalid HTML: the browser closes the paragraph
                early, so the server and client trees stop matching and React
                reports a hydration error. */}
            <div className="mt-2 text-xl font-bold">
                {unavailable ? '—' : value ?? <Skeleton className="h-6 w-10" />}
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {unavailable ? (
                <p className="mt-1 text-[11px] text-muted-foreground">Messaging is paused</p>
            ) : (
                // A full bar, purely as the design's visual rhythm — it encodes
                // no ratio, because there is no limit to be a ratio of.
                <Progress value={100} className={`mt-2 h-1 [&>div]:${tint}`} />
            )}
        </div>
    );
}

/* ── Right rail ──────────────────────────────────────────────────────────── */

function AccountSecurity() {
    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <SectionTitle icon={<ShieldCheck className="size-4" />} title="Account Security" />
                <p className="mt-2 text-xs text-muted-foreground">
                    Keep your account secure and manage your security settings.
                </p>

                <div className="mt-4 flex flex-col">
                    <RailRow icon={<Lock className="size-4" />} label="Change Password"
                        href="/dashboard/settings" />
                    {/* ⚠ No 2FA column and no TOTP anywhere in this backend. */}
                    <RailRow icon={<KeyRound className="size-4" />} label="Two-Factor Authentication"
                        trailing="Not available" />
                    {/* ⚠ Not merely unbuilt: sign-in issues a stateless JWT with
                        no server-side record, so there is nothing to enumerate. */}
                    <RailRow icon={<MonitorSmartphone className="size-4" />} label="Active Sessions"
                        trailing="Not available" />
                    <RailRow icon={<Settings2 className="size-4" />} label="Security Settings"
                        href="/dashboard/settings" />
                </div>

                <Link href="/dashboard/settings"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                    Go to Security Settings <ArrowRight className="size-3.5" />
                </Link>
            </CardContent>
        </Card>
    );
}

function PreferencesCard() {
    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <SectionTitle icon={<Palette className="size-4" />} title="Preferences" />
                <div className="mt-4 flex flex-col">
                    {/* ⚠ ALL FOUR need a client-preferences table that does not
                        exist. Reporting "Enabled" would be a claim about
                        behaviour nothing implements. */}
                    <RailRow icon={<Palette className="size-4" />} label="Theme" trailing="Not stored" />
                    <RailRow icon={<Mail className="size-4" />} label="Email Notifications" trailing="Not stored" />
                    <RailRow icon={<Megaphone className="size-4" />} label="Marketing Emails" trailing="Not stored" />
                    <RailRow icon={<BellRing className="size-4" />} label="Event Reminders" trailing="Not stored" />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                    Preferences need a table to save into — none exists yet.
                </p>
            </CardContent>
        </Card>
    );
}

function QuickActions() {
    return (
        <>
            <Card className="py-0">
                <CardContent className="p-5">
                    <SectionTitle icon={<Zap className="size-4" />} title="Quick Actions" />
                    <div className="mt-4 flex flex-col">
                        {/* ⚠ No export endpoint for either. Guests have one
                            (/client/guests/export); an account-wide data dump and
                            an events export do not exist. */}
                        <RailRow icon={<Download className="size-4" />} label="Download My Data"
                            trailing="Not available" />
                        <RailRow icon={<FileDown className="size-4" />} label="Export Events"
                            trailing="Not available" />
                        {/*
                          Links to the one screen that owns closing an account,
                          rather than confirming it a second way here. This page
                          used to run its own dialog with its own wording and no
                          identity check at all — the §308 divergence, in the flow
                          where it matters most.
                        */}
                        <Link
                            href="/dashboard/settings/delete-account"
                            className="flex items-center gap-3 border-t py-3 text-left text-destructive"
                        >
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-destructive/10">
                                <Trash2 className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-medium">Close Account</span>
                            <ChevronRight className="size-4 shrink-0" />
                        </Link>
                    </div>
                </CardContent>
            </Card>

        </>
    );
}

/* ── Shared ──────────────────────────────────────────────────────────────── */

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </span>
            <h2 className="text-base font-semibold">{title}</h2>
        </div>
    );
}

function RailRow({
    icon, label, href, trailing,
}: {
    icon: React.ReactNode; label: string; href?: string; trailing?: string;
}) {
    const body = (
        <>
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                {icon}
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium">{label}</span>
            {trailing && (
                <span className="shrink-0 text-xs text-muted-foreground">{trailing}</span>
            )}
            {href && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
        </>
    );

    // Only a row that leads somewhere is a link. The rest are plain rows, so
    // nothing looks clickable that isn't.
    return href ? (
        <Link href={href} className="flex items-center gap-3 border-t py-3 first:border-t-0 hover:bg-muted/40">
            {body}
        </Link>
    ) : (
        <div className="flex items-center gap-3 border-t py-3 first:border-t-0 opacity-70">{body}</div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-9 w-48" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="flex flex-col gap-6">
                    <Skeleton className="h-44 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
        </div>
    );
}
