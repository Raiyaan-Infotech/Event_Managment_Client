'use client';

import { useState } from 'react';
import {
    CreditCard, Star, Trash2, Plus, ShieldCheck, Lock, Info, TriangleAlert,
    Loader2, MoreVertical, Headphones, Landmark, Smartphone, BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    usePaymentMethods, useSetDefaultPaymentMethod, useRemovePaymentMethod,
    useAddPaymentMethod, useBillingOverview, formatMoney,
    type PaymentMethod, type PaymentMethodList,
} from '@/hooks/use-billing';
import { useDateFormatter } from '@/hooks/use-client-settings';

/**
 * Payment Methods.
 *
 * ── ⚠ WHY THERE IS NO CARD-NUMBER FIELD ON THIS SCREEN ──────────────────────
 * The supplied design draws Card Number / Expiry / CVC inputs — and, in its own
 * sidebar, "PCI DSS compliant · Powered by Stripe". Those two things cannot
 * both be plain HTML inputs posting to our backend. In a real Stripe or
 * Razorpay integration those boxes are the PROVIDER'S hosted fields, rendered
 * inside an iframe from the provider's own domain: the digits go straight to
 * them and never touch this application. That is exactly what makes the PCI
 * badge true rather than decorative.
 *
 * So the form is mounted only when a provider is connected, and it mounts the
 * provider's element — never our own <input>. The backend refuses a card-shaped
 * body outright, so this cannot be quietly "simplified" later into posting the
 * number ourselves.
 *
 * ── ⚠ SO HOW DOES ANYTHING GET ADDED? ───────────────────────────────────────
 * By the MANUAL route, which is what this project actually uses. No gateway is
 * coming: money arrives out of band — a UPI transfer, a bank transfer — and the
 * payment is recorded by hand afterwards. So a method here is not a chargeable
 * instrument at all. It is a RECORD OF HOW THE CLIENT PAYS, so the vendor knows
 * what to expect and can match it against a bank statement.
 *
 * Which is why the form below asks for a UPI ID or a bank account and NOT a
 * card. Four digits of a card nobody can verify, attached to something this
 * system cannot charge, would look like a saved card and behave like a note.
 *
 * The card guard is unchanged and still applies to this path. The server also
 * refuses a FULL account number rather than trimming it, so the whole number
 * never reaches it in the first place.
 *
 * ── EVERYTHING ELSE IS REAL TODAY ───────────────────────────────────────────
 * Listing, the default, promotion on removal, expiry, and the five-method cap
 * all work now and are covered by tests.
 */

export function PaymentMethodsPanel() {
    const { data, isLoading } = usePaymentMethods();
    const { data: billing } = useBillingOverview();
    const setDefault = useSetDefaultPaymentMethod();
    const remove = useRemovePaymentMethod();
    const fmt = useDateFormatter();
    const [confirmRemove, setConfirmRemove] = useState<PaymentMethod | null>(null);

    if (isLoading || !data) return <PaymentMethodsSkeleton />;

    const { methods, default_method: def, gateway, max_methods, manual } = data;
    const others = methods.filter((m) => !m.is_default);
    const sub = billing?.subscription ?? null;
    const busy = setDefault.isPending || remove.isPending;

    return (
        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex min-w-0 flex-col gap-4">
                {/* The provider's real state, with the server's own reason. */}
                {!gateway.enabled && (
                    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                        <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-warning">
                                No payment provider connected
                            </p>
                            <p className="mt-1 text-[12.5px] break-words text-muted-foreground">
                                {gateway.reason}
                            </p>
                        </div>
                    </div>
                )}

                <Card className="py-0">
                    <CardContent className="p-5">
                        <h2 className="text-[15px] font-semibold">Default Payment Method</h2>
                        <p className="mt-1 text-[12px] break-words text-muted-foreground">
                            This is the method that would be used for automatic payments.
                        </p>

                        <div className="mt-4">
                            {def ? (
                                <MethodRow method={def} fmt={fmt} />
                            ) : (
                                <EmptyRow
                                    text={methods.length
                                        ? 'None of your saved methods is set as the default.'
                                        : 'No payment method saved yet.'}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="py-0">
                    <CardContent className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-[15px] font-semibold">Saved Payment Methods</h2>
                            <span className="text-[11.5px] text-muted-foreground">
                                {methods.length} of {max_methods}
                            </span>
                        </div>

                        {others.length === 0 ? (
                            <div className="mt-4">
                                <EmptyRow text={def
                                    ? 'You have no other saved methods.'
                                    : 'Nothing saved yet.'} />
                            </div>
                        ) : (
                            <div className="mt-4 flex flex-col gap-2.5">
                                {others.map((m) => (
                                    <MethodRow
                                        key={m.id}
                                        method={m}
                                        fmt={fmt}
                                        busy={busy}
                                        onMakeDefault={() => setDefault.mutate(m.id)}
                                        onRemove={() => setConfirmRemove(m)}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="mt-4 flex min-w-0 items-start gap-2.5 rounded-lg border bg-muted/40 px-3.5 py-2.5">
                            <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                            <p className="min-w-0 text-[11.5px] break-words text-muted-foreground">
                                You can save up to {max_methods} payment methods. The limit is enforced
                                by the server, so it holds however you reach it.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <AddMethodCard
                    gateway={gateway}
                    manual={manual}
                    canAdd={data.can_add}
                    count={methods.length}
                    max={max_methods}
                />
            </div>

            <div className="flex min-w-0 flex-col gap-4">
                <Card className="py-0">
                    <CardContent className="p-5">
                        <h3 className="text-[13.5px] font-semibold">Billing Summary</h3>
                        <dl className="mt-3.5 flex flex-col gap-2.5 text-[12.5px]">
                            <SummaryRow label="Current Plan" value={sub?.plan?.name ?? 'No plan'} />
                            <SummaryRow label="Billing Cycle" value={sub?.billing_cycle ?? '—'} capitalize />
                            <SummaryRow
                                label="Next Billing Date"
                                value={sub?.next_billing_date ? fmt(sub.next_billing_date) : 'No upcoming charge'}
                            />
                            <SummaryRow
                                label="Amount"
                                value={sub ? formatMoney(sub.amount?.total ?? null, sub.currency_code) : '—'}
                            />
                            <SummaryRow
                                label="Payment Method"
                                value={def ? `···· ${def.last4 ?? '••••'}` : 'None saved'}
                            />
                        </dl>
                        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                            <Link href="/dashboard/billing/change-plan">Manage Plan</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="py-0">
                    <CardContent className="p-5">
                        <span className="grid size-9 place-items-center rounded-full bg-primary/10">
                            <Headphones className="size-[17px] text-primary" />
                        </span>
                        <h3 className="mt-3 text-[13.5px] font-semibold">Need Help?</h3>
                        <p className="mt-1.5 text-[12px] break-words text-muted-foreground">
                            Questions about your payment methods or billing? Send us a note and
                            somebody will come back to you.
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-3.5 w-full">
                            <Link href="/dashboard/billing/contact-sales">Contact us</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/*
                  The design's "Secure Payments" panel, with the claims it can
                  actually support. It does NOT print a PCI DSS badge or a
                  provider's logo while no provider is connected — a compliance
                  badge for an integration that does not exist is the one claim
                  on this screen nobody should make.
                */}
                <Card className="py-0">
                    <CardContent className="p-5">
                        <span className="grid size-9 place-items-center rounded-full bg-emerald-500/15">
                            <ShieldCheck className="size-[17px] text-emerald-600 dark:text-emerald-400" />
                        </span>
                        <h3 className="mt-3 text-[13.5px] font-semibold">How your card is kept safe</h3>
                        <p className="mt-1.5 text-[12px] break-words text-muted-foreground">
                            {gateway.enabled
                                ? `Your card is held by ${titleCase(gateway.name)} — never by us. We keep only the
                                   last four digits and the expiry, so you can recognise it. Those cannot
                                   be used to charge anything.`
                                : `When a payment provider is connected, your card will be held by them —
                                   never by us. We would keep only the last four digits and the expiry, so
                                   you can tell your cards apart.`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!confirmRemove} onOpenChange={(open) => !open && setConfirmRemove(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove this payment method?</DialogTitle>
                        <DialogDescription>
                            {confirmRemove?.label} will be removed from your account. Invoices it has
                            already paid will still show it. If it is your default, another saved
                            method takes over.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmRemove(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={remove.isPending}
                            onClick={() => {
                                if (!confirmRemove) return;
                                remove.mutate(confirmRemove.id, { onSuccess: () => setConfirmRemove(null) });
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

function MethodRow({
    method, fmt, busy, onMakeDefault, onRemove,
}: {
    method: PaymentMethod;
    fmt: (v: string | null | undefined, withTime?: boolean) => string;
    busy?: boolean;
    onMakeDefault?: () => void;
    onRemove?: () => void;
}) {
    return (
        <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border p-3.5">
            <MethodMark method={method} />

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold break-words">{method.label}</p>
                    {method.is_default && (
                        <Badge variant="secondary" className="h-5 text-[10.5px]">Default</Badge>
                    )}
                    {method.is_expired && (
                        <Badge variant="destructive" className="h-5 text-[10.5px]">Expired</Badge>
                    )}
                    {/*
                      Only claimed when it is true. A manual method was typed by
                      the client and nobody checked it, so the absence of this
                      badge is the honest state — not a missing feature.
                    */}
                    {method.is_verified && (
                        <Badge variant="secondary" className="h-5 gap-1 text-[10.5px]">
                            <BadgeCheck className="size-3" /> Verified
                        </Badge>
                    )}
                </div>
                <p className="mt-0.5 text-[11.5px] break-words text-muted-foreground">
                    {method.method_type === 'bank_transfer'
                        ? method.ifsc ?? 'No IFSC recorded'
                        : method.method_type === 'upi'
                            ? 'You transfer to us — nothing is charged automatically'
                            : method.expiry_label ? `Expires ${method.expiry_label}` : 'No expiry recorded'}
                    {method.holder_name ? ` · ${method.holder_name}` : ''}
                    {` · added ${fmt(method.created_at)}`}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                {/* An expired card cannot be made the default — the server
                    refuses it, so the button does not offer it either. */}
                {onMakeDefault && !method.is_expired && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={onMakeDefault}>
                        <Star className="size-3.5" /> Make Default
                    </Button>
                )}
                {onRemove && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8" aria-label="More actions">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {!method.is_expired && onMakeDefault && (
                                <DropdownMenuItem onClick={onMakeDefault}>
                                    <Star className="size-3.5" /> Set as default
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem variant="destructive" onClick={onRemove}>
                                <Trash2 className="size-3.5" /> Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}

/**
 * The brand block. Text, not a logo file — shipping Visa/Mastercard artwork
 * means licensing their marks, and a wrong or stretched logo looks worse than
 * a clean label.
 */
export function BrandMark({ brand }: { brand: string | null }) {
    return (
        <span className="grid h-8 w-12 shrink-0 place-items-center rounded-md border bg-muted text-[9.5px] font-bold tracking-wide uppercase">
            {brand ? brand.slice(0, 6) : <CreditCard className="size-4 text-muted-foreground" />}
        </span>
    );
}

/** The same block, but a UPI or bank method gets its own mark rather than a card's. */
function MethodMark({ method }: { method: PaymentMethod }) {
    if (method.method_type === 'card') return <BrandMark brand={method.brand} />;
    const Icon = method.method_type === 'upi' ? Smartphone : Landmark;
    return (
        <span className="grid h-8 w-12 shrink-0 place-items-center rounded-md border bg-muted">
            <Icon className="size-4 text-muted-foreground" />
        </span>
    );
}

/**
 * The Add form.
 *
 * TWO SHAPES, and which one appears is decided by the server, not by a constant
 * here:
 *
 *  · A provider IS connected -> mount THEIR hosted card field. Never inputs of
 *    our own; the digits must go from the browser straight to them, which is
 *    the whole reason a card can be taken safely at all.
 *  · No provider -> the manual form below. A UPI ID or a bank account, which
 *    records how the client pays so a transfer can be matched when it arrives.
 *
 * ⚠ There is no card option on the manual form, deliberately. Four digits of a
 * card nobody verified, against an instrument nothing can charge, would look
 * like a saved card and behave like a sticky note.
 */
function AddMethodCard({
    gateway, manual, canAdd, count, max,
}: {
    gateway: PaymentMethodList['gateway'];
    manual: PaymentMethodList['manual'];
    canAdd: boolean;
    count: number;
    max: number;
}) {
    const add = useAddPaymentMethod();
    const atLimit = count >= max;

    const [type, setType] = useState(manual.types[0]?.value ?? 'upi');
    const [upi, setUpi] = useState('');
    const [bank, setBank] = useState('');
    const [last4, setLast4] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [holder, setHolder] = useState('');
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const reset = () => {
        setUpi(''); setBank(''); setLast4(''); setIfsc(''); setHolder(''); setErrors({});
    };

    function submit() {
        if (add.isPending) return;

        // The shared pattern: mark every missing field, then ONE toast that does
        // not name a field — the asterisks on screen already do that.
        const bad: Record<string, boolean> = {};
        if (type === 'upi') {
            if (!upi.trim()) bad.upi = true;
        } else {
            if (!bank.trim()) bad.bank = true;
            if (last4.length !== 4) bad.last4 = true;
        }
        if (Object.keys(bad).length) {
            setErrors(bad);
            toast.error('Please fill all mandatory fields.');
            return;
        }
        setErrors({});

        add.mutate(
            type === 'upi'
                ? { method_type: 'upi', upi_id: upi.trim(), holder_name: holder.trim() || undefined }
                : {
                    method_type: 'bank_transfer',
                    bank_name: bank.trim(),
                    account_last4: last4,
                    ifsc: ifsc.trim() || undefined,
                    holder_name: holder.trim() || undefined,
                },
            { onSuccess: reset },
        );
    }

    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <h2 className="text-[15px] font-semibold">Add a Payment Method</h2>

                {gateway.enabled ? (
                    atLimit ? (
                        <>
                            <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                                You have reached the limit of {max} saved payment methods. Remove one to
                                add another.
                            </p>
                            <Button className="mt-4" disabled>
                                <Plus className="size-4" /> Add Payment Method
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                                Your card is entered in {titleCase(gateway.name)}&rsquo;s own secure field
                                and never reaches this application.
                            </p>
                            {/*
                              Where the provider's element mounts. Left as a marked
                              slot rather than a fake form: the element is created by
                              the provider's SDK with the publishable key, and there is
                              no honest way to stand in for it.
                            */}
                            <div
                                id="gateway-card-element"
                                className="mt-4 rounded-lg border border-dashed p-6 text-center text-[12px] text-muted-foreground"
                            >
                                {titleCase(gateway.name)} card field mounts here.
                            </div>
                            <Button className="mt-4" disabled={!canAdd}>
                                <Plus className="size-4" /> Add Payment Method
                            </Button>
                        </>
                    )
                ) : atLimit ? (
                    <>
                        <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                            You have reached the limit of {max} saved payment methods. Remove one to
                            add another.
                        </p>
                        <Button className="mt-4" disabled>
                            <Plus className="size-4" /> Add Payment Method
                        </Button>
                    </>
                ) : (
                    <>
                        {/* The server's sentence, not ours — it is what keeps a
                            recorded method from reading like a saved card. */}
                        <p className="mt-1.5 text-[12.5px] break-words text-muted-foreground">
                            {manual.reason}
                        </p>

                        <div className="mt-4 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[12px]">How do you pay? *</Label>
                                <div className="flex flex-wrap gap-2">
                                    {manual.types.map((t) => (
                                        <Button
                                            key={t.value}
                                            type="button"
                                            size="sm"
                                            variant={type === t.value ? 'default' : 'outline'}
                                            onClick={() => { setType(t.value); setErrors({}); }}
                                        >
                                            {t.value === 'upi'
                                                ? <Smartphone className="size-3.5" />
                                                : <Landmark className="size-3.5" />}
                                            {t.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {type === 'upi' ? (
                                <Field
                                    id="upi-id" label="UPI ID" required error={errors.upi}
                                    hint="Looks like name@bank. This is a payment address — it cannot be used to charge you."
                                >
                                    <Input
                                        id="upi-id"
                                        value={upi}
                                        onChange={(e) => setUpi(e.target.value)}
                                        placeholder="name@okhdfcbank"
                                        autoComplete="off"
                                        aria-invalid={errors.upi || undefined}
                                    />
                                </Field>
                            ) : (
                                <>
                                    <Field id="bank-name" label="Bank name" required error={errors.bank}>
                                        <Input
                                            id="bank-name"
                                            value={bank}
                                            onChange={(e) => setBank(e.target.value)}
                                            placeholder="HDFC Bank"
                                            aria-invalid={errors.bank || undefined}
                                        />
                                    </Field>

                                    <Field
                                        id="acc-last4" label="Last 4 digits of your account" required
                                        error={errors.last4}
                                        hint="Four digits only. The server refuses a longer value rather than trimming it, so your full account number never reaches us."
                                    >
                                        <Input
                                            id="acc-last4"
                                            value={last4}
                                            inputMode="numeric"
                                            maxLength={4}
                                            // Capped and stripped in the field itself: the
                                            // point is that a full number cannot be typed
                                            // here, not that it is discarded afterwards.
                                            onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            placeholder="4242"
                                            autoComplete="off"
                                            aria-invalid={errors.last4 || undefined}
                                        />
                                    </Field>

                                    <Field
                                        id="ifsc" label="IFSC"
                                        hint="Optional. A public branch code, like HDFC0001234 — not a secret."
                                    >
                                        <Input
                                            id="ifsc"
                                            value={ifsc}
                                            maxLength={11}
                                            onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))}
                                            placeholder="HDFC0001234"
                                            autoComplete="off"
                                        />
                                    </Field>
                                </>
                            )}

                            <Field id="holder" label="Name on the account" hint="Optional.">
                                <Input
                                    id="holder"
                                    value={holder}
                                    onChange={(e) => setHolder(e.target.value)}
                                    placeholder="As it appears on your statement"
                                />
                            </Field>

                            <Button onClick={submit} disabled={add.isPending || !canAdd}>
                                {add.isPending
                                    ? <Loader2 className="size-4 animate-spin" />
                                    : <Plus className="size-4" />}
                                Save payment method
                            </Button>

                            <p className="flex min-w-0 items-start gap-2 rounded-lg border border-dashed px-3.5 py-2.5 text-[11.5px] break-words text-muted-foreground">
                                <Lock className="mt-0.5 size-3.5 shrink-0" />
                                We never ask for a card number, a CVC or a full account number, and there
                                is nowhere in this system to store one. What you enter here is only used
                                to recognise your payment when it arrives.
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * One labelled field.
 *
 * The asterisk and the red ring are the only per-field error signalling — the
 * toast on submit stays generic, so somebody filling three empty boxes gets one
 * message rather than three.
 */
function Field({ id, label, required, error, hint, children }: {
    id: string;
    label: string;
    required?: boolean;
    error?: boolean;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor={id} className="text-[12px]">
                {label}{required ? <span className="text-destructive"> *</span> : null}
            </Label>
            {children}
            {error ? (
                <span className="text-[11px] text-destructive">This is required.</span>
            ) : hint ? (
                <span className="text-[11px] break-words text-muted-foreground">{hint}</span>
            ) : null}
        </div>
    );
}

function SummaryRow({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className={`min-w-0 text-end font-medium break-words ${capitalize ? 'capitalize' : ''}`}>
                {value}
            </dd>
        </div>
    );
}

function EmptyRow({ text }: { text: string }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-dashed p-4">
            <CreditCard className="size-4 shrink-0 text-muted-foreground" />
            <p className="min-w-0 text-[12.5px] break-words text-muted-foreground">{text}</p>
        </div>
    );
}

const titleCase = (v: string | null) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : 'the provider');

function PaymentMethodsSkeleton() {
    return (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-4">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-56 rounded-xl" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
        </div>
    );
}
