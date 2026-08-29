'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, CheckCircle2, Mail, Phone, Send, Loader2, ShieldCheck, Info,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import { useContactSales } from '@/hooks/use-billing';
import { useClientProfile } from '@/hooks/use-client-portal';

/**
 * Contact Sales.
 *
 * ⚠ THE SUBMISSION IS STORED, NOT EMAILED. There is no SMTP anywhere in this
 * system. The row lands in `client_sales_enquiries` for somebody to follow up,
 * and the success state says a person will be in touch — it does NOT claim a
 * message was sent, because none was.
 *
 * The alternative was a form that silently discards what is typed into it,
 * which this codebase has shipped before and which reads as working right up
 * until somebody checks.
 */

const INTERESTS = [
    'Custom Plan & Pricing',
    'Enterprise Features',
    'White-label / Branding',
    'API Access & Integrations',
    'Other (Please specify)',
];

const EVENT_VOLUMES = ['Under 10 events', '10 - 50 events', '50 - 100 events', '100+ events'];
const TIMES = ['Anytime', 'Morning', 'Afternoon', 'Evening'];

export default function ContactSalesPage() {
    const profile = useClientProfile();
    const contact = useContactSales();

    const [form, setForm] = useState({
        full_name: '', work_email: '', company_name: '', phone: '',
        events_per_year: '', message: '', preferred_time: 'Anytime',
    });
    const [interests, setInterests] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [sent, setSent] = useState(false);

    /**
     * Prefill ONCE per account.
     *
     * Keyed on the client's id rather than the object, or a background refetch
     * re-runs this and overwrites whatever is half-typed — the same bug the
     * Settings form had.
     */
    const clientId = profile.data?.id ?? null;
    const [seeded, setSeeded] = useState<number | null>(null);
    useEffect(() => {
        if (clientId === null || seeded === clientId) return;
        setForm((prev) => ({
            ...prev,
            full_name: profile.data?.name ?? '',
            work_email: profile.data?.email ?? '',
            company_name: profile.data?.company_name ?? '',
            phone: profile.data?.mobile ?? '',
        }));
        setSeeded(clientId);
    }, [clientId, seeded, profile.data]);

    // Functional updater throughout: a `{ ...form }` spread here would write
    // back a stale snapshot when two fields change in quick succession.
    const set = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: false }));
    };

    const submit = () => {
        const next: Record<string, boolean> = {
            full_name: !form.full_name.trim(),
            work_email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.work_email.trim()),
            message: !form.message.trim(),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) {
            // The shared wording every form in this project uses, never a
            // field-specific toast.
            import('sonner').then(({ toast }) => toast.error('Please fill all mandatory fields.'));
            return;
        }

        contact.mutate(
            { ...form, interests: interests.length ? interests : undefined },
            { onSuccess: () => setSent(true) },
        );
    };

    if (sent) {
        return (
            <div className="flex min-w-0 flex-col gap-5 p-4 md:p-6">
                <Card className="py-0">
                    <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
                        <span className="grid size-12 place-items-center rounded-full bg-emerald-500/15">
                            <CheckCircle2 className="size-6 text-emerald-500" />
                        </span>
                        <h1 className="text-xl font-semibold">Thanks — we have your enquiry</h1>
                        {/*
                          Careful wording. Nothing was emailed, so this promises a
                          follow-up rather than claiming a message went out.
                        */}
                        <p className="max-w-md text-[12.5px] break-words text-muted-foreground">
                            Your details are saved and our team will get back to you, usually within
                            one business day.
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/dashboard/billing">Back to Billing</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href="/dashboard">Go to Dashboard</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-5 p-4 md:p-6">
            <div className="flex flex-col gap-1">
                <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit text-muted-foreground">
                    <Link href="/dashboard/billing"><ArrowLeft className="size-3.5" /> Back to Billing</Link>
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">Contact Our Sales Team</h1>
                <p className="text-sm text-muted-foreground">
                    Tell us what you need and our team will get back to you with the right solution.
                </p>
            </div>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[1.1fr_1fr]">
                <Card className="py-0">
                    <CardContent className="flex flex-col gap-4 p-5">
                        <div>
                            <p className="text-sm font-medium">Send us a message</p>
                            <p className="text-[12.5px] text-muted-foreground">
                                Fill out the form and our team will reach out.
                            </p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="cs-name">Full Name <span className="text-rose-500">*</span></Label>
                            <Input
                                id="cs-name" value={form.full_name}
                                onChange={(e) => set('full_name', e.target.value)}
                                className={errors.full_name ? 'border-rose-500' : ''}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="cs-email">Work Email <span className="text-rose-500">*</span></Label>
                            <Input
                                id="cs-email" type="email" value={form.work_email}
                                onChange={(e) => set('work_email', e.target.value)}
                                className={errors.work_email ? 'border-rose-500' : ''}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="cs-company">Company Name</Label>
                                <Input id="cs-company" value={form.company_name}
                                    onChange={(e) => set('company_name', e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="cs-phone">Phone Number</Label>
                                <Input id="cs-phone" value={form.phone}
                                    onChange={(e) => set('phone', e.target.value)} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>How many events do you host per year?</Label>
                            {/* This project's SelectTrigger defaults to w-fit, not w-full. */}
                            <Select value={form.events_per_year} onValueChange={(v) => set('events_per_year', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EVENT_VOLUMES.map((v) => (
                                        <SelectItem key={v} value={v}>{v}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>What are you interested in?</Label>
                            {INTERESTS.map((item) => (
                                <label key={item} className="flex items-start gap-2 text-[12.5px]">
                                    <Checkbox
                                        checked={interests.includes(item)}
                                        onCheckedChange={(checked) =>
                                            setInterests((prev) =>
                                                checked ? [...prev, item] : prev.filter((x) => x !== item),
                                            )
                                        }
                                    />
                                    <span className="min-w-0 break-words">{item}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="cs-message">
                                Tell us more about your requirements <span className="text-rose-500">*</span>
                            </Label>
                            <Textarea
                                id="cs-message" rows={5} value={form.message}
                                onChange={(e) => set('message', e.target.value)}
                                className={errors.message ? 'border-rose-500' : ''}
                                placeholder="What are you trying to do, and what is getting in the way?"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Preferred time to connect</Label>
                            <Select value={form.preferred_time} onValueChange={(v) => set('preferred_time', v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Anytime" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={submit} disabled={contact.isPending} className="w-full">
                            {contact.isPending
                                ? <Loader2 className="size-3.5 animate-spin" />
                                : <Send className="size-3.5" />}
                            Send Message
                        </Button>

                        <p className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-[11px] break-words text-muted-foreground">
                            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                            Your details are used only to contact you about this enquiry.
                        </p>
                    </CardContent>
                </Card>

                <div className="flex min-w-0 flex-col gap-5">
                    <Card className="py-0">
                        <CardContent className="flex flex-col gap-3 p-5">
                            <span className="text-sm font-medium">Why talk to our sales team?</span>
                            {[
                                ['Tailored solutions', 'A plan that fits your exact requirements.'],
                                ['Volume pricing', 'Custom pricing as you scale.'],
                                ['Dedicated onboarding', 'Personalised setup and training for your team.'],
                                ['Priority support', 'Faster help from people who know your account.'],
                            ].map(([title, body]) => (
                                <div key={title} className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                    <div className="min-w-0">
                                        <p className="text-[12.5px] font-medium break-words">{title}</p>
                                        <p className="text-[12.5px] break-words text-muted-foreground">{body}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="py-0">
                        <CardContent className="flex flex-col gap-3 p-5">
                            <span className="text-sm font-medium">Other ways to reach us</span>
                            {/*
                              ⚠ No contact details are hardcoded here. The mockup showed
                              sales@eventinvit.com and a phone number; inventing a
                              mailbox nobody monitors sends people into a void. The
                              form is the route that actually reaches somebody.
                            */}
                            <div className="flex items-start gap-2">
                                <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <p className="min-w-0 text-[12.5px] break-words text-muted-foreground">
                                    Use the form — it reaches the same team and we reply from your
                                    account&apos;s email address.
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <p className="min-w-0 text-[12.5px] break-words text-muted-foreground">
                                    Prefer a call? Say so in your message and leave a number above.
                                </p>
                            </div>
                            <Separator />
                            <p className="flex items-start gap-2 text-[11px] break-words text-muted-foreground">
                                <Info className="mt-0.5 size-3.5 shrink-0" />
                                Enquiries are recorded in your account and reviewed by our team.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
