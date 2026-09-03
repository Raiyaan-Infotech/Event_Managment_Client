'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Sparkles, Image as ImageIcon, Video, Palette, Layers, Crown, Heart,
    Music, Loader2 as LoaderIcon, Wand2, MousePointerClick, SlidersHorizontal,
    Upload, X, Loader2, Info, RotateCcw, Save, ArrowRight,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
    useCreateSplashScreen, useUpdateSplashScreen, useSplashScreen, useUploadSplashMedia,
    type SplashScreenPayload, type BackgroundType, type ButtonStyle,
} from '@/hooks/use-splash-screens';
import { SplashPreviewCard, type SplashPreviewData } from './splash-preview';

/**
 * Add / Edit Splash Screen.
 *
 * ── ⚠ NOT TIED TO AN EVENT YET ───────────────────────────────────────────────
 * "Event Name" is free text. See the hook file header for why — this module
 * ships its own CRUD first, and linking to a real event is a later phase.
 *
 * ── ⚠ ANIMATION IS SAVED, NOT DELIVERED ─────────────────────────────────────
 * The Animation panel says so directly rather than implying it already works
 * — the mobile app has no splash-rendering screen to read it yet.
 *
 * ── PREVIEW IS ILLUSTRATIVE, NOT PIXEL-ACCURATE ─────────────────────────────
 * It mirrors the real fields (title, background, button) using CSS, not a
 * frame from the mobile app's own renderer, because that renderer does not
 * exist yet either.
 */

type BackgroundConfig = Record<string, string | number | boolean | undefined>;

interface FormState {
    name: string;
    main_title: string;
    sub_title: string;
    event_name: string;
    tagline: string;

    background_type: BackgroundType;
    background_url: string;
    fallback_image_url: string;
    background_config: BackgroundConfig;

    sound_enabled: boolean;
    sound_url: string;
    sound_config: { auto_play: boolean; loop: boolean; volume: number };

    loader_enabled: boolean;
    loader_config: { style: string; color: string; size: number; background_color: string };

    animation_enabled: boolean;
    animation_config: {
        style: string; speed: string; density: number;
        overlay_color: string; overlay_opacity: number; loop: boolean;
    };

    button_text: string;
    button_style: ButtonStyle;
    button_color: string;

    show_couple_name: boolean;
    show_event_date: boolean;
    show_tagline: boolean;
}

const EMPTY: FormState = {
    name: '', main_title: '', sub_title: '', event_name: '', tagline: '',
    background_type: 'image', background_url: '', fallback_image_url: '', background_config: {},
    sound_enabled: false, sound_url: '', sound_config: { auto_play: true, loop: true, volume: 70 },
    loader_enabled: true, loader_config: { style: 'dots', color: '#E91E63', size: 60, background_color: '#0B0F1A' },
    animation_enabled: false,
    animation_config: { style: 'floating_particles', speed: 'normal', density: 60, overlay_color: '#000000', overlay_opacity: 30, loop: true },
    button_text: 'Enter Invitation', button_style: 'filled', button_color: '#E91E63',
    show_couple_name: true, show_event_date: true, show_tagline: true,
};

const BACKGROUND_TYPES: { value: BackgroundType; label: string; icon: typeof ImageIcon }[] = [
    { value: 'image', label: 'Image', icon: ImageIcon },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'solid_color', label: 'Solid Color', icon: Palette },
    { value: 'gradient', label: 'Gradient', icon: Layers },
    { value: 'logo', label: 'Logo', icon: Crown },
    { value: 'couple_photo', label: 'Couple Photo', icon: Heart },
];

export function SplashForm({ splashId }: { splashId?: number }) {
    const router = useRouter();
    const isEdit = !!splashId;

    const existing = useSplashScreen(splashId);
    const create = useCreateSplashScreen((s) => router.push(`/dashboard/splash-screens/${s.id}`));
    const update = useUpdateSplashScreen(() => toast.success('Saved'));
    const saving = create.isPending || update.isPending;

    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key as string] ? { ...prev, [key]: false } : prev));
    };
    const setBgConfig = (patch: BackgroundConfig) =>
        setForm((prev) => ({ ...prev, background_config: { ...prev.background_config, ...patch } }));

    /*
      Seeded from PROPS during render, not in an effect — keyed on the row's
      id so it fires once when it first arrives and never again for the same
      splash screen. A background refetch has the same id and does not
      re-seed, so it cannot discard what is being typed; an effect version
      would also cost an extra render pass setting state synchronously
      inside it, which is what this pattern avoids (see settings/page.tsx's
      ProfileTab for the same reasoning applied to the same problem).
    */
    const [seededFor, setSeededFor] = useState<number | null>(null);
    if (isEdit && existing.data && seededFor !== existing.data.id) {
        setSeededFor(existing.data.id);
        const s = existing.data;
        setForm({
            name: s.name, main_title: s.main_title, sub_title: s.sub_title ?? '',
            event_name: s.event_name, tagline: s.tagline ?? '',
            background_type: s.background_type,
            background_url: s.background_url ?? '', fallback_image_url: s.fallback_image_url ?? '',
            background_config: (s.background_config as BackgroundConfig) ?? {},
            sound_enabled: s.sound_enabled, sound_url: s.sound_url ?? '',
            sound_config: {
                auto_play: s.sound_config?.auto_play ?? true,
                loop: s.sound_config?.loop ?? true,
                volume: s.sound_config?.volume ?? 70,
            },
            loader_enabled: s.loader_enabled,
            loader_config: {
                style: s.loader_config?.style ?? 'dots',
                color: s.loader_config?.color ?? '#E91E63',
                size: s.loader_config?.size ?? 60,
                background_color: s.loader_config?.background_color ?? '#0B0F1A',
            },
            animation_enabled: s.animation_enabled,
            animation_config: {
                style: s.animation_config?.style ?? 'floating_particles',
                speed: s.animation_config?.speed ?? 'normal',
                density: s.animation_config?.density ?? 60,
                overlay_color: s.animation_config?.overlay_color ?? '#000000',
                overlay_opacity: s.animation_config?.overlay_opacity ?? 30,
                loop: s.animation_config?.loop ?? true,
            },
            button_text: s.button_text, button_style: s.button_style, button_color: s.button_color ?? '#E91E63',
            show_couple_name: s.show_couple_name, show_event_date: s.show_event_date, show_tagline: s.show_tagline,
        });
    }

    const buildPayload = (status: 'draft' | 'active'): Partial<SplashScreenPayload> => ({
        name: form.name.trim(), main_title: form.main_title.trim(),
        sub_title: form.sub_title.trim() || null, event_name: form.event_name.trim(),
        tagline: form.tagline.trim() || null,
        background_type: form.background_type,
        background_url: form.background_url || null,
        fallback_image_url: form.fallback_image_url || null,
        background_config: form.background_config,
        sound_enabled: form.sound_enabled, sound_url: form.sound_url || null, sound_config: form.sound_config,
        loader_enabled: form.loader_enabled, loader_config: form.loader_config,
        animation_enabled: form.animation_enabled, animation_config: form.animation_config,
        button_text: form.button_text.trim() || 'Enter Invitation',
        button_style: form.button_style, button_color: form.button_color || null,
        show_couple_name: form.show_couple_name, show_event_date: form.show_event_date, show_tagline: form.show_tagline,
        status,
    });

    const submit = (status: 'draft' | 'active') => {
        if (saving) return;
        const bad: Record<string, boolean> = {};
        if (!form.name.trim()) bad.name = true;
        if (!form.main_title.trim()) bad.main_title = true;
        if (!form.event_name.trim()) bad.event_name = true;
        if (Object.keys(bad).length) {
            setErrors(bad);
            toast.error('Please fill all mandatory fields.');
            return;
        }

        const payload = buildPayload(status);
        if (isEdit && splashId) update.mutate({ id: splashId, data: payload });
        else create.mutate(payload);
    };

    if (isEdit && existing.isLoading) {
        return (
            <div className="flex flex-col gap-5">
                <Skeleton className="h-9 w-64" />
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <Skeleton className="h-[600px] rounded-xl" />
                    <Skeleton className="h-[600px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <Button asChild variant="link" size="sm" className="h-auto w-fit p-0 text-[12.5px]">
                        <Link href="/dashboard/splash-screens">← Back to Splash Screens</Link>
                    </Button>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">
                        {isEdit ? 'Edit Splash Screen' : 'Add Splash Screen (Invitation)'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create a beautiful splash screen for your event.
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" disabled={saving} onClick={() => submit('draft')}>
                        {create.isPending || update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Save as Draft
                    </Button>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="flex min-w-0 flex-col gap-5">
                    <ContentCard form={form} errors={errors} set={set} />
                    <BackgroundCard form={form} set={set} setBgConfig={setBgConfig} />
                    <SoundCard form={form} set={set} />
                    <LoaderCard form={form} set={set} />
                    <AnimationCard form={form} set={set} />
                    <ButtonCard form={form} set={set} />
                    <AdditionalSettingsCard form={form} set={set} />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button
                            variant="outline"
                            onClick={() => { setForm(EMPTY); setErrors({}); }}
                        >
                            <RotateCcw className="size-4" /> Reset
                        </Button>
                        <Button disabled={saving} onClick={() => submit('active')}>
                            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                            {isEdit ? 'Save Changes' : 'Save & Continue'}
                            {!saving && <ArrowRight className="size-4" />}
                        </Button>
                    </div>
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                    <SplashPreviewCard data={toPreviewData(form)} />
                </div>
            </div>
        </div>
    );
}

/* ── Shared pieces ───────────────────────────────────────────────────────── */

function SectionCard({
    icon: Icon, title, action, children,
}: { icon: typeof ImageIcon; title: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-md bg-primary/10">
                            <Icon className="size-4 text-primary" />
                        </span>
                        <p className="text-[13.5px] font-bold">{title}</p>
                    </div>
                    {action}
                </div>
                {children}
            </CardContent>
        </Card>
    );
}

function Field({
    label, hint, error, maxLength, value, required,
}: { label: string; hint?: string; error?: boolean; maxLength?: number; value?: string; required?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <Label className="text-[12.5px] font-medium">
                {label}{required && <span className="text-destructive"> *</span>}
                {hint && <span className="ml-1.5 font-normal text-muted-foreground">({hint})</span>}
            </Label>
            {maxLength !== undefined && (
                <span className={cn('text-[10.5px] text-muted-foreground', error && 'text-destructive')}>
                    {(value ?? '').length}/{maxLength}
                </span>
            )}
        </div>
    );
}

/** Hex text field + native colour swatch, side by side. */
function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center gap-2">
            <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border">
                <span className="absolute inset-0" style={{ backgroundColor: value || '#000000' }} />
                <input
                    type="color"
                    value={/^#([0-9a-fA-F]{6})$/.test(value) ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                />
            </label>
            <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#E91E63" className="font-mono" />
        </div>
    );
}

function PercentSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <Label className="text-[12.5px] font-medium">{label}</Label>
                <span className="text-[11.5px] text-muted-foreground">{value}%</span>
            </div>
            <input
                type="range" min={0} max={100} value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
        </div>
    );
}

/**
 * One file → its stored URL. Fires on pick, independent of the rest of the
 * form's save — same shape as the avatar uploader elsewhere in this portal.
 */
function MediaUploadField({
    label, hint, accept, value, onChange,
}: { label: string; hint?: string; accept: string; value: string; onChange: (url: string) => void }) {
    const upload = useUploadSplashMedia();
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-2">
            <Label className="text-[12.5px] font-medium">{label}</Label>
            {value ? (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                    {/^image\//.test(accept) || accept.includes('image') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={value} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                    ) : (
                        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted">
                            <Upload className="size-4 text-muted-foreground" />
                        </span>
                    )}
                    <p className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">{value.split('/').pop()}</p>
                    <Button size="icon" variant="ghost" className="size-8 shrink-0" onClick={() => onChange('')}>
                        <X className="size-4" />
                    </Button>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={upload.isPending}
                    onClick={() => inputRef.current?.click()}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/40 disabled:opacity-60"
                >
                    {upload.isPending ? (
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    ) : (
                        <Upload className="size-5 text-muted-foreground" />
                    )}
                    <span className="text-[12.5px] font-medium">
                        {upload.isPending ? 'Uploading…' : 'Click to upload or drag and drop'}
                    </span>
                    {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) upload.mutate(file, { onSuccess: onChange });
                }}
            />
        </div>
    );
}

/* ── Content ─────────────────────────────────────────────────────────────── */

function ContentCard({
    form, errors, set,
}: { form: FormState; errors: Record<string, boolean>; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
    return (
        <SectionCard icon={Sparkles} title="1. Content">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Field label="Main Title" required maxLength={60} value={form.main_title} error={errors.main_title} />
                    <Input
                        value={form.main_title} onChange={(e) => set('main_title', e.target.value.slice(0, 60))}
                        placeholder="YOU'RE INVITED" className={cn(errors.main_title && 'border-destructive')}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Field label="Sub Title" maxLength={20} value={form.sub_title} />
                    <Input value={form.sub_title} onChange={(e) => set('sub_title', e.target.value.slice(0, 20))} placeholder="To" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Field label="Event Name" required maxLength={100} value={form.event_name} error={errors.event_name} />
                    <Input
                        value={form.event_name} onChange={(e) => set('event_name', e.target.value.slice(0, 100))}
                        placeholder="Priya & Arjun Wedding" className={cn(errors.event_name && 'border-destructive')}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Field label="Tagline" hint="Optional" maxLength={150} value={form.tagline} />
                    <Input value={form.tagline} onChange={(e) => set('tagline', e.target.value.slice(0, 150))} placeholder="Together with their families" />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Field label="Internal Name" required hint="For your list only — guests never see this" maxLength={150} value={form.name} error={errors.name} />
                    <Input
                        value={form.name} onChange={(e) => set('name', e.target.value.slice(0, 150))}
                        placeholder="e.g. Priya & Arjun — Wedding Splash" className={cn(errors.name && 'border-destructive')}
                    />
                </div>
            </div>
        </SectionCard>
    );
}

/* ── Background ──────────────────────────────────────────────────────────── */

function BackgroundCard({
    form, set, setBgConfig,
}: {
    form: FormState;
    set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
    setBgConfig: (patch: BackgroundConfig) => void;
}) {
    const cfg = form.background_config;

    return (
        <SectionCard icon={ImageIcon} title="2. Background">
            <div className="flex flex-col gap-4">
                <div>
                    <Label className="text-[12.5px] font-medium">Background Type</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {BACKGROUND_TYPES.map((t) => (
                            <Button
                                key={t.value}
                                type="button"
                                variant={form.background_type === t.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => { set('background_type', t.value); set('background_url', ''); setBgConfig({}); }}
                            >
                                <t.icon className="size-3.5" /> {t.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {form.background_type === 'image' && (
                    <>
                        <MediaUploadField
                            label="Upload Background Image" hint="PNG or JPG, max 20MB"
                            accept="image/jpeg,image/png,image/webp"
                            value={form.background_url} onChange={(url) => set('background_url', url)}
                        />
                        <PercentSlider label="Overlay" value={Number(cfg.overlay ?? 0)} onChange={(v) => setBgConfig({ overlay: v })} />
                    </>
                )}

                {form.background_type === 'video' && (
                    <>
                        <MediaUploadField
                            label="Upload Video" hint="MP4 or WebM, max 20MB"
                            accept="video/mp4,video/webm"
                            value={form.background_url} onChange={(url) => set('background_url', url)}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[12.5px] font-medium">Video Start</Label>
                                <Select value={String(cfg.video_start ?? 'from_beginning')} onValueChange={(v) => setBgConfig({ video_start: v })}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="from_beginning">From Beginning</SelectItem>
                                        <SelectItem value="middle">From Middle</SelectItem>
                                        <SelectItem value="last_5s">Last 5 seconds</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <PercentSlider label="Video Volume" value={Number(cfg.volume ?? 80)} onChange={(v) => setBgConfig({ volume: v })} />
                        </div>
                        <PercentSlider label="Video Overlay" value={Number(cfg.overlay ?? 40)} onChange={(v) => setBgConfig({ overlay: v })} />
                        <MediaUploadField
                            label="Fallback Image" hint="Optional — shown if the video can't play"
                            accept="image/jpeg,image/png,image/webp"
                            value={form.fallback_image_url} onChange={(url) => set('fallback_image_url', url)}
                        />
                    </>
                )}

                {form.background_type === 'solid_color' && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[12.5px] font-medium">Background Color</Label>
                            <ColorInput value={String(cfg.color ?? '#E91E63')} onChange={(v) => setBgConfig({ color: v })} />
                        </div>
                        <PercentSlider label="Overlay Opacity" value={Number(cfg.overlay ?? 0)} onChange={(v) => setBgConfig({ overlay: v })} />
                    </>
                )}

                {form.background_type === 'gradient' && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[12.5px] font-medium">Gradient Type</Label>
                            <div className="flex gap-2">
                                {(['linear', 'radial'] as const).map((gt) => (
                                    <Button
                                        key={gt} type="button" size="sm"
                                        variant={cfg.gradient_type === gt || (!cfg.gradient_type && gt === 'linear') ? 'default' : 'outline'}
                                        onClick={() => setBgConfig({ gradient_type: gt })}
                                    >
                                        {gt === 'linear' ? 'Linear' : 'Radial'}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[12.5px] font-medium">Color 1</Label>
                                <ColorInput value={String(cfg.color_1 ?? '#6A11CB')} onChange={(v) => setBgConfig({ color_1: v })} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[12.5px] font-medium">Color 2</Label>
                                <ColorInput value={String(cfg.color_2 ?? '#FF2575')} onChange={(v) => setBgConfig({ color_2: v })} />
                            </div>
                        </div>
                        <div
                            className="h-8 w-full rounded-md"
                            style={{ background: `linear-gradient(135deg, ${cfg.color_1 ?? '#6A11CB'}, ${cfg.color_2 ?? '#FF2575'})` }}
                        />
                    </>
                )}

                {form.background_type === 'logo' && (
                    <>
                        <MediaUploadField
                            label="Upload Logo" hint="PNG, JPG or SVG, max 2MB"
                            accept="image/jpeg,image/png,image/svg+xml"
                            value={form.background_url} onChange={(url) => set('background_url', url)}
                        />
                        <PercentSlider label="Logo Size" value={Number(cfg.size ?? 60)} onChange={(v) => setBgConfig({ size: v })} />
                    </>
                )}

                {form.background_type === 'couple_photo' && (
                    <>
                        <MediaUploadField
                            label="Upload Couple Photo" hint="PNG or JPG, max 5MB"
                            accept="image/jpeg,image/png,image/webp"
                            value={form.background_url} onChange={(url) => set('background_url', url)}
                        />
                        <PercentSlider label="Overlay" value={Number(cfg.overlay ?? 40)} onChange={(v) => setBgConfig({ overlay: v })} />
                        <div className="flex items-center justify-between gap-3">
                            <Label className="text-[12.5px] font-medium">Dark Overlay</Label>
                            <Switch checked={!!cfg.dark_overlay} onCheckedChange={(v) => setBgConfig({ dark_overlay: v })} />
                        </div>
                    </>
                )}
            </div>
        </SectionCard>
    );
}

/* ── Sound ───────────────────────────────────────────────────────────────── */

function SoundCard({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
    return (
        <SectionCard
            icon={Music} title="Sound on Splash"
            action={<Switch checked={form.sound_enabled} onCheckedChange={(v) => set('sound_enabled', v)} />}
        >
            <p className="mb-4 text-[12.5px] text-muted-foreground">
                Add background music to create an engaging first impression for your guests.
            </p>
            {form.sound_enabled && (
                <div className="flex flex-col gap-4">
                    <MediaUploadField
                        label="Upload Audio" hint="MP3, WAV or OGG, max 5MB" accept="audio/mpeg,audio/wav,audio/ogg"
                        value={form.sound_url} onChange={(url) => set('sound_url', url)}
                    />
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2.5">
                            <Switch
                                checked={form.sound_config.auto_play}
                                onCheckedChange={(v) => set('sound_config', { ...form.sound_config, auto_play: v })}
                            />
                            <Label className="text-[12.5px] font-medium">Auto Play Sound</Label>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Switch
                                checked={form.sound_config.loop}
                                onCheckedChange={(v) => set('sound_config', { ...form.sound_config, loop: v })}
                            />
                            <Label className="text-[12.5px] font-medium">Loop Sound</Label>
                        </div>
                    </div>
                    <PercentSlider
                        label="Volume" value={form.sound_config.volume}
                        onChange={(v) => set('sound_config', { ...form.sound_config, volume: v })}
                    />
                </div>
            )}
        </SectionCard>
    );
}

/* ── Loader ──────────────────────────────────────────────────────────────── */

const LOADER_STYLES = ['dots', 'ring', 'spinner', 'pulse', 'bars', 'bounce', 'wave'];

function LoaderCard({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
    return (
        <SectionCard
            icon={LoaderIcon} title="Show Loader"
            action={<Switch checked={form.loader_enabled} onCheckedChange={(v) => set('loader_enabled', v)} />}
        >
            {form.loader_enabled && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[12.5px] font-medium">Loader Style</Label>
                        <div className="flex flex-wrap gap-2">
                            {LOADER_STYLES.map((style) => (
                                <Button
                                    key={style} type="button" size="sm"
                                    variant={form.loader_config.style === style ? 'default' : 'outline'}
                                    onClick={() => set('loader_config', { ...form.loader_config, style })}
                                    className="capitalize"
                                >
                                    {style}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[12.5px] font-medium">Loader Color</Label>
                            <ColorInput value={form.loader_config.color} onChange={(v) => set('loader_config', { ...form.loader_config, color: v })} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[12.5px] font-medium">Background Color</Label>
                            <ColorInput value={form.loader_config.background_color} onChange={(v) => set('loader_config', { ...form.loader_config, background_color: v })} />
                        </div>
                    </div>
                    <PercentSlider label="Loader Size" value={form.loader_config.size} onChange={(v) => set('loader_config', { ...form.loader_config, size: v })} />
                </div>
            )}
        </SectionCard>
    );
}

/* ── Animation ───────────────────────────────────────────────────────────── */

const ANIMATION_STYLES = [
    { value: 'floating_particles', label: 'Floating Particles' },
    { value: 'rose_petals', label: 'Rose Petals' },
    { value: 'lights_sparkles', label: 'Lights & Sparkles' },
    { value: 'bokeh_lights', label: 'Bokeh Lights' },
    { value: 'fireworks', label: 'Fireworks' },
];

function AnimationCard({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
    return (
        <SectionCard
            icon={Wand2} title="Enable Animation"
            action={<Switch checked={form.animation_enabled} onCheckedChange={(v) => set('animation_enabled', v)} />}
        >
            {/* ⚠ Said up front, not buried — this is the one panel on this form
                that cannot yet do what it visually promises. */}
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning/10 p-3">
                <Info className="mt-0.5 size-3.5 shrink-0 text-warning" />
                <p className="text-[11.5px] text-muted-foreground">
                    Animations are visible in the mobile app only, and that screen is not built yet.
                    Your choice is saved now and will start working the day it is.
                </p>
            </div>

            {form.animation_enabled && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[12.5px] font-medium">Animation Style</Label>
                        <div className="flex flex-wrap gap-2">
                            {ANIMATION_STYLES.map((a) => (
                                <Button
                                    key={a.value} type="button" size="sm"
                                    variant={form.animation_config.style === a.value ? 'default' : 'outline'}
                                    onClick={() => set('animation_config', { ...form.animation_config, style: a.value })}
                                >
                                    {a.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[12.5px] font-medium">Animation Speed</Label>
                            <Select
                                value={form.animation_config.speed}
                                onValueChange={(v) => set('animation_config', { ...form.animation_config, speed: v })}
                            >
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="slow">Slow</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="fast">Fast</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <PercentSlider
                            label="Particle Density" value={form.animation_config.density}
                            onChange={(v) => set('animation_config', { ...form.animation_config, density: v })}
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[12.5px] font-medium">Overlay Color</Label>
                            <ColorInput
                                value={form.animation_config.overlay_color}
                                onChange={(v) => set('animation_config', { ...form.animation_config, overlay_color: v })}
                            />
                        </div>
                        <PercentSlider
                            label="Overlay Opacity" value={form.animation_config.overlay_opacity}
                            onChange={(v) => set('animation_config', { ...form.animation_config, overlay_opacity: v })}
                        />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Switch
                            checked={form.animation_config.loop}
                            onCheckedChange={(v) => set('animation_config', { ...form.animation_config, loop: v })}
                        />
                        <Label className="text-[12.5px] font-medium">Loop Animation</Label>
                    </div>
                </div>
            )}
        </SectionCard>
    );
}

/* ── Button ──────────────────────────────────────────────────────────────── */

function ButtonCard({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
    return (
        <SectionCard icon={MousePointerClick} title="Button Settings">
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                    <Field label="Button Text" maxLength={25} value={form.button_text} />
                    <Input value={form.button_text} onChange={(e) => set('button_text', e.target.value.slice(0, 25))} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[12.5px] font-medium">Button Style</Label>
                    <div className="flex gap-1.5">
                        {(['filled', 'outline', 'text'] as ButtonStyle[]).map((style) => (
                            <Button
                                key={style} type="button" size="sm"
                                variant={form.button_style === style ? 'default' : 'outline'}
                                onClick={() => set('button_style', style)}
                                className="flex-1 capitalize"
                            >
                                {style === 'text' ? 'Text Only' : style}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[12.5px] font-medium">Button Color</Label>
                    <ColorInput value={form.button_color} onChange={(v) => set('button_color', v)} />
                </div>
            </div>
        </SectionCard>
    );
}

/* ── Additional settings ─────────────────────────────────────────────────── */

function AdditionalSettingsCard({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
    const toggles: { key: keyof FormState; label: string }[] = [
        { key: 'show_couple_name', label: 'Show Couple Name' },
        { key: 'show_event_date', label: 'Show Event Date on Splash' },
        { key: 'show_tagline', label: 'Show Tagline' },
    ];
    return (
        <SectionCard icon={SlidersHorizontal} title="Additional Settings">
            <div className="grid gap-4 sm:grid-cols-2">
                {toggles.map((t) => (
                    <div key={t.key} className="flex items-center justify-between gap-3">
                        <Label className="text-[12.5px] font-medium">{t.label}</Label>
                        <Switch checked={Boolean(form[t.key])} onCheckedChange={(v) => set(t.key, v as FormState[typeof t.key])} />
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}

/* ── Preview ─────────────────────────────────────────────────────────────── */

/** The live form's own shape has no nulls (inputs need a defined value); the
    shared preview component takes the saved-row shape, so this is the one
    place that reconciles the two. */
function toPreviewData(form: FormState): SplashPreviewData {
    return {
        main_title: form.main_title,
        sub_title: form.sub_title || null,
        event_name: form.event_name,
        tagline: form.tagline || null,
        background_type: form.background_type,
        background_url: form.background_url || null,
        background_config: form.background_config,
        button_text: form.button_text,
        button_style: form.button_style,
        button_color: form.button_color || null,
        show_tagline: form.show_tagline,
        sound_enabled: form.sound_enabled,
        loader_enabled: form.loader_enabled,
        animation_enabled: form.animation_enabled,
    };
}
