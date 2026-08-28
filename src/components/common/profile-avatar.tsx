'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

import { mediaUrl } from '@/lib/media-url';
import { ImageCropDialog } from '@/components/common/image-crop-dialog';
import { useUploadAvatar, useRemoveAvatar } from '@/hooks/use-client-portal';

/**
 * The client's profile photo, with pick, crop, upload and remove.
 *
 * Shared by Settings and My Profile. Extracted rather than copied: two avatars
 * that both upload would drift on the crop shape, the accepted formats and the
 * reset-the-input detail, and the first symptom would be one of them silently
 * refusing to re-pick the same file.
 */
export function ProfileAvatar({
    client,
    size = 80,
}: {
    client: { name: string; avatar_url: string | null } | null;
    size?: number;
}) {
    const upload = useUploadAvatar();
    const remove = useRemoveAvatar();
    const inputRef = useRef<HTMLInputElement>(null);
    const [picked, setPicked] = useState<File | null>(null);
    const busy = upload.isPending || remove.isPending;

    const initials = (client?.name ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || '?';

    return (
        <div
            className="flex flex-col items-center gap-2"
            style={{ ['--avatar-size' as string]: `${size / 4}rem` }}
        >
            <div className="relative size-[var(--avatar-size)] shrink-0">
                {client?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        // Keyed on the URL so a NEW photo actually repaints. The
                        // uploader gives every file a fresh name, but without a
                        // key React keeps the same <img> and the browser can sit
                        // on the decoded old one.
                        key={client.avatar_url}
                        // Resolved against the BACKEND origin: a local-driver
                        // upload stores a path relative to the API, and this
                        // portal is on a different port.
                        src={mediaUrl(client.avatar_url)}
                        alt=""
                        className="size-[var(--avatar-size)] rounded-full object-cover"
                    />
                ) : (
                    <div className="grid size-[var(--avatar-size)] place-items-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
                        {initials}
                    </div>
                )}

                <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                    title="Change photo"
                    className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                >
                    {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    // Narrower than the server's filter on purpose: the picker
                    // should not offer files the upload will refuse.
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        // Reset FIRST, so choosing the SAME file again still
                        // fires `change` — otherwise a re-pick after a cancelled
                        // crop does nothing at all.
                        e.target.value = '';
                        // Crop before upload, never after: uploading first would
                        // leave the uncropped original on the server — wasted
                        // storage, and a copy of a photo they chose not to show.
                        if (file) setPicked(file);
                    }}
                />
            </div>

            {client?.avatar_url && (
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove.mutate()}
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-60"
                >
                    Remove photo
                </button>
            )}

            {/* Square, and round in the cropper, because that is exactly how the
                avatar renders — cropping to a shape the result is not is how you
                get a face with its chin cut off. */}
            <ImageCropDialog
                file={picked}
                open={picked !== null}
                onOpenChange={(o) => { if (!o) setPicked(null); }}
                aspect={1}
                outputSize={512}
                onCropped={(cropped) => {
                    setPicked(null);
                    upload.mutate(cropped);
                }}
            />
        </div>
    );
}
