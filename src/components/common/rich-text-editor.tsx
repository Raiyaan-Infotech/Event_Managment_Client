'use client';

import React, { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { CodeXml, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * The admin panel's rich text editor, ported to the client portal.
 *
 * ── ⚠ TWO THINGS THE ADMIN VERSION HAS THAT THIS ONE DOES NOT ───────────────
 *
 * 1. **No image upload.** The admin editor posts to `/media/upload`, which sits
 *    behind the ADMIN token plus a `media.upload` permission and the approval
 *    middleware. A client has none of those, so that button would 403 every
 *    time it was pressed. It is removed rather than shipped broken — the same
 *    reason `useUploadAvatar` goes to `/client/me/avatar` instead.
 *
 * 2. **No `video` / `image` formats**, for the same reason plus one more: this
 *    HTML ends up in an EMAIL, and an embedded video does not play in a mail
 *    client. Offering it would produce a blank rectangle in every inbox.
 *
 * ── IT PRODUCES HTML, WHICH IS ONLY RIGHT FOR SOME CHANNELS ─────────────────
 * Anything that renders a value from this editor must use
 * `dangerouslySetInnerHTML`, never plain text — splitting or escaping it shows
 * the client their own markup. And a channel that is NOT html-capable (WhatsApp
 * is a plain-text protocol; it uses `*bold*`, not `<b>`) must not use this
 * editor at all, or the guest receives the tags literally.
 *
 * ── `insertTextAtCursor` IS THE POINT OF THE REF ────────────────────────────
 * A merge-field picker has to drop `{first_name}` where the caret is. Appending
 * would put it after the signature every time somebody went back to fix the
 * greeting — which is exactly when they use the picker.
 */

// Dynamic, ssr:false — Quill touches `document` at module scope.
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-[260px] w-full animate-pulse rounded-md border bg-muted" />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

export const TOOLBAR_VARIANTS = {
    full: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        ['blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
    ],
    /** What an email body actually needs. Anything more is a decoration. */
    compact: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
    ],
    basic: [
        ['bold', 'italic', 'underline'],
        ['link', 'clean'],
    ],
};

export interface RichTextEditorRef {
    insertTextAtCursor: (text: string) => void;
}

interface RichTextEditorProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    variant?: 'full' | 'compact' | 'basic';
    /** Rendered into the toolbar row — the merge-field picker lives here. */
    customButtons?: React.ReactNode;
    /** Marks the field invalid, matching every other input on these forms. */
    invalid?: boolean;
    minHeight?: number;
}

export const RichTextEditor = React.forwardRef<RichTextEditorRef, RichTextEditorProps>(({
    value = '',
    onChange,
    placeholder = 'Type here…',
    className,
    variant = 'compact',
    customButtons,
    invalid,
    minHeight = 260,
}, ref) => {
    const [isSourceMode, setIsSourceMode] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quillRef = useRef<any>(null);
    const sourceRef = useRef<HTMLTextAreaElement>(null);

    const modules = useMemo(() => ({ toolbar: TOOLBAR_VARIANTS[variant] }), [variant]);

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent', 'align', 'link', 'color', 'background',
    ];

    React.useImperativeHandle(ref, () => ({
        insertTextAtCursor: (text: string) => {
            // Source mode is a plain textarea, so it needs the textarea path.
            if (isSourceMode) {
                const el = sourceRef.current;
                if (!el) { onChange(value + text); return; }
                const start = el.selectionStart;
                const end = el.selectionEnd;
                onChange(value.slice(0, start) + text + value.slice(end));
                setTimeout(() => {
                    el.focus();
                    el.setSelectionRange(start + text.length, start + text.length);
                }, 0);
                return;
            }

            const quill = quillRef.current?.getEditor?.();
            if (!quill) { onChange(value + text); return; }
            quill.focus();
            // No selection means the caret was never placed — the end of the
            // document is the only sensible place left.
            const range = quill.getSelection() ?? { index: quill.getLength(), length: 0 };
            quill.insertText(range.index, text);
            quill.setSelection(range.index + text.length);
        },
    }));

    return (
        <div
            className={cn(
                'min-w-0 overflow-hidden rounded-lg border',
                invalid && 'border-destructive',
                className,
            )}
        >
            <div className="flex min-w-0 flex-wrap items-center gap-1 border-b bg-muted/40 px-2 py-1.5">
                {customButtons}
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="ms-auto h-7 gap-1 text-[11.5px]"
                    onClick={() => setIsSourceMode((v) => !v)}
                    title={isSourceMode ? 'Back to the editor' : 'Edit the HTML directly'}
                >
                    {isSourceMode ? <Eye className="size-3.5" /> : <CodeXml className="size-3.5" />}
                    {isSourceMode ? 'Editor' : 'HTML'}
                </Button>
            </div>

            {isSourceMode ? (
                <Textarea
                    ref={sourceRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="rounded-none border-0 font-mono text-[12px] shadow-none focus-visible:ring-0"
                    style={{ minHeight }}
                    placeholder="<p>…</p>"
                />
            ) : (
                /*
                  `quill-host` is styled in globals.css. Quill ships its own
                  Snow theme with hard-coded light colours; without the overrides
                  the editor is a white box in dark mode.
                */
                <div className="quill-host" style={{ minHeight }}>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={value}
                        onChange={onChange}
                        modules={modules}
                        formats={formats}
                        placeholder={placeholder}
                    />
                </div>
            )}
        </div>
    );
});

RichTextEditor.displayName = 'RichTextEditor';

/**
 * HTML to readable plain text.
 *
 * For a LIST SNIPPET and nothing else — a table cell must not render markup,
 * and escaping it would show the client `&lt;p&gt;`. Block tags become spaces
 * so words do not run together, then entities are decoded.
 *
 * ⚠ Not a sanitiser. It strips tags for DISPLAY; it does not make untrusted
 * HTML safe to inject anywhere.
 */
export function htmlToText(html: string | null | undefined) {
    if (!html) return '';
    return String(html)
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

/** Whether an editor value carries anything a person would call content. */
export function htmlIsEmpty(html: string | null | undefined) {
    if (!html) return true;
    // Quill leaves "<p><br></p>" behind when you delete everything, which is
    // not empty by `.trim()` but is empty to the person looking at it.
    return htmlToText(html).length === 0 && !/<img|<hr/i.test(html);
}
