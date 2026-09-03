'use client';

import { Smartphone, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BackgroundType, ButtonStyle } from '@/hooks/use-splash-screens';

/**
 * The phone-frame renderer, shared by the editor (live, as you type) and the
 * list's "View" dialog (read-only, from a saved row).
 *
 * ⚠ Illustrative, not pixel-accurate: this is CSS mirroring the real fields,
 * not a frame from the mobile app's own renderer — that renderer does not
 * exist yet either. See the splash-screens module header for why.
 *
 * One shared shape rather than two copies of this logic: the form's live
 * state and a saved `SplashScreen` row differ only in which fields are
 * allowed to be empty, so both are normalised to this interface at the call
 * site instead of the rendering logic being written twice and drifting.
 */
export interface SplashPreviewData {
    main_title: string;
    sub_title: string | null;
    event_name: string;
    tagline: string | null;
    background_type: BackgroundType;
    background_url: string | null;
    background_config: Record<string, unknown> | null;
    button_text: string;
    button_style: ButtonStyle;
    button_color: string | null;
    show_tagline: boolean;
    sound_enabled: boolean;
    loader_enabled: boolean;
    animation_enabled: boolean;
}

/** Just the phone, no card chrome — for embedding in a "View" dialog at a larger size. */
export function SplashPreviewFrame({ data, className }: { data: SplashPreviewData; className?: string }) {
    const cfg = data.background_config ?? {};

    const backgroundStyle: React.CSSProperties = (() => {
        switch (data.background_type) {
            case 'solid_color':
                return { backgroundColor: String(cfg.color || '#E91E63') };
            case 'gradient':
                return {
                    background: `${cfg.gradient_type === 'radial' ? 'radial-gradient' : 'linear-gradient'}(135deg, ${cfg.color_1 || '#6A11CB'}, ${cfg.color_2 || '#FF2575'})`,
                };
            case 'image':
            case 'couple_photo':
                return data.background_url
                    ? { backgroundImage: `url(${data.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { backgroundColor: '#1a1a1a' };
            case 'video':
                // The <video> element itself renders on top when a URL exists;
                // this is only the fallback shown while it has none.
                return { backgroundColor: '#1a1a1a' };
            case 'logo':
                return { backgroundColor: '#faf7f2' };
            default:
                return { backgroundColor: '#1a1a1a' };
        }
    })();

    const overlayOpacity = Number(cfg.overlay ?? 0) / 100;
    const buttonClasses = cn(
        'mt-4 rounded-full px-5 py-2 text-[12px] font-semibold',
        data.button_style === 'filled' && 'text-white',
        data.button_style === 'outline' && 'border-2 bg-transparent',
        data.button_style === 'text' && 'bg-transparent',
    );

    return (
        <div className={cn('relative overflow-hidden rounded-[24px] border-4 border-black bg-black shadow-lg', className)}>
            <div className="relative flex h-full flex-col items-center justify-center gap-2 p-5 text-center" style={backgroundStyle}>
                {/* A real video plays here — this is the one case the preview is
                    not just a static swatch, because a moving background is the
                    entire point of choosing this type. Muted, so autoplay is
                    allowed without a click; looped, since a splash has no
                    natural "end". */}
                {data.background_type === 'video' && data.background_url && (
                    <video
                        src={data.background_url}
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay muted loop playsInline
                    />
                )}
                {overlayOpacity > 0 && (
                    <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
                )}
                {data.background_type === 'logo' && data.background_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={data.background_url} alt=""
                        className="relative z-10 mb-2 object-contain"
                        style={{ width: `${Number(cfg.size ?? 60)}%` }}
                    />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1.5 text-white">
                    <p className="text-[15px] font-black tracking-wide uppercase">{data.main_title || "YOU'RE INVITED"}</p>
                    {data.sub_title && <p className="text-[9px] uppercase opacity-80">{data.sub_title}</p>}
                    <p className="text-[16px] font-semibold italic" style={{ fontFamily: 'Georgia, serif' }}>
                        {data.event_name || 'Event Name'}
                    </p>
                    {data.show_tagline && data.tagline && (
                        <p className="mt-1 text-[10px] opacity-85">{data.tagline}</p>
                    )}
                    <button
                        type="button"
                        className={buttonClasses}
                        style={{
                            backgroundColor: data.button_style === 'filled' ? (data.button_color || '#E91E63') : 'transparent',
                            borderColor: data.button_color || '#E91E63',
                            color: data.button_style === 'filled' ? '#fff' : (data.button_color || '#E91E63'),
                        }}
                    >
                        {data.button_text || 'Enter Invitation'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/** The frame plus the editor's card chrome and status badges. */
export function SplashPreviewCard({ data }: { data: SplashPreviewData }) {
    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                    <Smartphone className="size-4 text-muted-foreground" />
                    <p className="text-[13px] font-bold">Splash Preview</p>
                </div>
                <p className="mb-4 text-[11.5px] text-muted-foreground">This is how your splash screen will look.</p>

                <SplashPreviewFrame data={data} className="mx-auto aspect-[9/19] w-full max-w-[220px]" />

                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                    {data.sound_enabled && <Badge variant="secondary" className="gap-1 text-[10px]"><Music className="size-3" /> Sound</Badge>}
                    {data.loader_enabled && <Badge variant="secondary" className="text-[10px]">Loader</Badge>}
                    {data.animation_enabled && <Badge variant="secondary" className="text-[10px]">Animated (app only)</Badge>}
                </div>
            </CardContent>
        </Card>
    );
}
