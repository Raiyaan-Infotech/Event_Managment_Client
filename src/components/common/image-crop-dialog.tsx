'use client';

import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Loader2, ZoomIn } from 'lucide-react';

import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/**
 * Crop a picked image before it is uploaded.
 *
 * ── WHY CROPPING AT ALL ─────────────────────────────────────────────────────
 * An avatar is rendered in a circle at a fixed size. Uploading the raw file
 * means the browser centre-crops whatever came off the camera — a 4:3 photo
 * loses its sides, a portrait loses the face. Choosing the crop is the whole
 * difference between "my photo" and "a piece of my photo".
 *
 * It also cuts what is stored: a modern phone photo is 3-8MB and would be
 * rejected by the 4MB cap, when the square that actually gets displayed is a
 * few dozen KB.
 *
 * ── crop-then-UPLOAD, not crop-then-save ────────────────────────────────────
 * This hands back a `File`, and the caller uploads it. The alternative — upload
 * first, crop the stored file afterwards — leaves the uncropped original on the
 * server, which is both wasted storage and a copy of a photo the person chose
 * not to publish.
 *
 * ── EXPORTED AS A DIALOG, NOT A PAGE ────────────────────────────────────────
 * So any upload point can use it without routing.
 */
export function ImageCropDialog({
    file,
    open,
    onOpenChange,
    onCropped,
    aspect = 1,
    outputSize = 512,
    title = 'Crop your photo',
}: {
    /** The picked file. Null closes the dialog. */
    file: File | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Receives the cropped file, ready to upload. */
    onCropped: (file: File) => void;
    /** Width / height. 1 for a circular avatar. */
    aspect?: number;
    /** Longest edge of the exported image, in pixels. */
    outputSize?: number;
    title?: string;
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState<Area | null>(null);
    const [working, setWorking] = useState(false);

    const objectUrl = useObjectUrl(file);

    const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

    const confirm = async () => {
        if (!file || !area) return;
        setWorking(true);
        try {
            const cropped = await cropToFile(objectUrl!, area, file.name, outputSize);
            onCropped(cropped);
            onOpenChange(false);
        } finally {
            setWorking(false);
            // Reset, or reopening the dialog for a different photo starts at the
            // previous one's zoom and offset.
            setZoom(1);
            setCrop({ x: 0, y: 0 });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Drag to reposition, and use the slider to zoom.
                    </DialogDescription>
                </DialogHeader>

                {/* The cropper needs a positioned box with real height — it fills
                    its container absolutely and collapses to nothing without one. */}
                <div className="relative h-64 w-full overflow-hidden rounded-md bg-muted">
                    {objectUrl && (
                        <Cropper
                            image={objectUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            cropShape={aspect === 1 ? 'round' : 'rect'}
                            showGrid={aspect !== 1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
                    <Label className="sr-only" htmlFor="crop-zoom">Zoom</Label>
                    <input
                        id="crop-zoom"
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={confirm} disabled={!area || working}>
                        {working && <Loader2 className="size-4 animate-spin" />}
                        Use photo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * An object URL for the picked file, revoked when it changes or unmounts.
 *
 * Not revoking leaks the whole file into memory for the life of the tab, which
 * on a few 8MB photos is very noticeable.
 */
function useObjectUrl(file: File | null): string | null {
    const [url, setUrl] = useState<string | null>(null);
    const [seen, setSeen] = useState<File | null>(null);

    // Derived during render rather than in an effect, so the cropper has a URL
    // on its FIRST paint — an effect gives it one frame of an empty box.
    if (file !== seen) {
        if (url) URL.revokeObjectURL(url);
        setSeen(file);
        setUrl(file ? URL.createObjectURL(file) : null);
    }

    return url;
}

/**
 * Draw the chosen region onto a canvas and export it as a file.
 *
 * Exported as JPEG at 0.9 unless the source was a PNG, in which case PNG is
 * kept — a PNG avatar is usually a logo or a screenshot with flat colour, and
 * JPEG turns its edges to mush. Transparency is not preserved either way: the
 * canvas is filled white first, because a transparent avatar over a dark theme
 * renders as a hole.
 */
async function cropToFile(src: string, area: Area, name: string, size: number): Promise<File> {
    const image = await loadImage(src);

    // Never upscale: a 200px crop exported at 512 is just a blurry 200px crop
    // in a bigger file.
    const edge = Math.min(size, Math.round(Math.max(area.width, area.height)));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(edge * (area.width / Math.max(area.width, area.height)));
    canvas.height = Math.round(edge * (area.height / Math.max(area.width, area.height)));

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not process that image.');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
        image,
        area.x, area.y, area.width, area.height,
        0, 0, canvas.width, canvas.height,
    );

    const isPng = /\.png$/i.test(name);
    const type = isPng ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, isPng ? undefined : 0.9),
    );
    if (!blob) throw new Error('Your browser could not process that image.');

    const base = name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${base}.${isPng ? 'png' : 'jpg'}`, { type });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // The source is an object URL from the local file, so there is nothing
        // cross-origin to taint the canvas — toBlob cannot throw a SecurityError
        // here the way it would for a remote image.
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('That file could not be read as an image.'));
        img.src = src;
    });
}
