'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Eye, Search, TriangleAlert } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ApiError } from '@/lib/api-client';
import { SignInPrompt } from '@/components/common/sign-in-prompt';
import { DynamicIcon } from '@/components/common/dynamic-icon';
import {
    useEventNotificationTemplates,
    useToggleEventNotificationTemplate,
    type ApplicableTemplate,
} from '@/hooks/use-event-notification-templates';

const FALLBACK_COLOR = '#6B7280';
const ALL = 'all';

/** Light-tint background + full-strength text, from the category's own hex. */
function categoryBadgeStyle(color: string | null | undefined) {
    const hex = color || FALLBACK_COLOR;
    return { backgroundColor: `${hex}1A`, color: hex };
}

/**
 * One event's notification templates — the client's own on/off control.
 *
 * Turning a template off here only affects THIS event. It does not touch the
 * admin's master template, and does not affect any other event using the
 * same template. Unlike the admin's catalogue screen, there is no edit,
 * duplicate or delete here — a client only ever toggles.
 */
export function EventNotificationTemplatesContent({ eventId }: { eventId: number }) {
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState(ALL);
    const [previewing, setPreviewing] = useState<ApplicableTemplate | null>(null);

    const { data, isLoading, isError, error, refetch } = useEventNotificationTemplates(eventId);
    const toggle = useToggleEventNotificationTemplate(eventId);

    const authError = error instanceof ApiError && error.isAuthError;
    const templates = useMemo(() => data?.templates ?? [], [data]);

    const categories = useMemo(() => {
        const map = new Map<number, string>();
        templates.forEach((t) => { if (t.notificationCategory) map.set(t.notificationCategory.id, t.notificationCategory.name); });
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [templates]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return templates.filter((t) => {
            if (categoryId !== ALL && String(t.notificationCategory?.id) !== categoryId) return false;
            if (!q) return true;
            return (
                t.name.toLowerCase().includes(q) ||
                t.title.toLowerCase().includes(q) ||
                t.content.toLowerCase().includes(q)
            );
        });
    }, [templates, search, categoryId]);

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold">
                        {data?.event.name ?? 'Notification Templates'}
                    </h1>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                        Turn individual notifications on or off for this event only.
                    </p>
                </div>
                <Link
                    href="/dashboard/messages/notification-templates"
                    className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-[12.5px] font-medium text-foreground hover:bg-muted"
                >
                    <ArrowLeft className="size-3.5" /> Back to Events
                </Link>
            </div>

            {authError && (
                <Card className="border-warning/40 bg-warning/10 shadow-none py-0">
                    <CardContent className="flex items-start gap-3 p-4">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                        <div>
                            <p className="text-[12.5px] font-semibold text-foreground">You are not signed in</p>
                            <p className="mt-0.5 text-[12px] text-muted-foreground">
                                Your session has ended. Sign in again to carry on.
                            </p>
                            <SignInPrompt className="mt-2.5" />
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="border border-border shadow-none py-0">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
                    <div className="relative w-full flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search templates by name, title or content..."
                            className="h-10 w-full rounded-md pl-9 text-[13px]"
                        />
                    </div>

                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="h-10 w-full rounded-md text-[13px] sm:w-[220px]">
                            <SelectValue placeholder="All Notification Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All Notification Categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card className="min-w-0 gap-0 border border-border p-0 shadow-none">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="divide-y divide-border">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4">
                                    <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                    <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : isError && !authError ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-center">
                            <TriangleAlert className="size-6 text-warning/60" />
                            <p className="text-[14px] font-semibold text-foreground">Could not load this event</p>
                            <p className="text-[13px] text-muted-foreground">
                                {error instanceof Error ? error.message : 'Unknown error.'}
                            </p>
                            <button
                                onClick={() => refetch()}
                                className="mt-2 text-[12.5px] font-semibold text-primary hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-center">
                            <Bell className="size-6 text-muted-foreground/40" />
                            <p className="text-[14px] font-semibold text-foreground">
                                {templates.length === 0 ? 'No templates apply to this event' : 'No templates match your search'}
                            </p>
                            <p className="text-[13px] text-muted-foreground">
                                {templates.length === 0
                                    ? "Templates matching this event's category and type will appear here once created."
                                    : 'Try a different search term.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[820px] text-left text-[13px]">
                                    <thead>
                                        <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            <th className="px-4 py-3 w-10">#</th>
                                            <th className="px-4 py-3">Template Name</th>
                                            <th className="px-4 py-3">Notification Category</th>
                                            <th className="px-4 py-3">Title</th>
                                            <th className="px-4 py-3">Content Preview</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filtered.map((t: ApplicableTemplate, index: number) => (
                                            <tr key={t.id}>
                                                <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <span
                                                            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border"
                                                            style={
                                                                t.notificationCategory?.color
                                                                    ? { backgroundColor: `${t.notificationCategory.color}1A` }
                                                                    : undefined
                                                            }
                                                        >
                                                            <DynamicIcon
                                                                name={t.notificationCategory?.icon}
                                                                color={t.notificationCategory?.color}
                                                                className="size-3.5"
                                                            />
                                                        </span>
                                                        <span className="break-words font-semibold text-foreground">{t.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {t.notificationCategory && (
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10.5px] font-semibold"
                                                            style={categoryBadgeStyle(t.notificationCategory.color)}
                                                        >
                                                            <DynamicIcon
                                                                name={t.notificationCategory.icon}
                                                                color={t.notificationCategory.color}
                                                                className="size-3"
                                                            />
                                                            {t.notificationCategory.name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="max-w-[180px] px-4 py-3 text-foreground">
                                                    <span className="line-clamp-1 break-words">{t.title}</span>
                                                </td>
                                                <td className="max-w-[260px] px-4 py-3 text-muted-foreground">
                                                    <span className="line-clamp-1 break-words">{t.content}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Switch
                                                        checked={t.enabled}
                                                        disabled={toggle.isPending}
                                                        onCheckedChange={(checked) =>
                                                            toggle.mutate({ templateId: t.id, enabled: checked })
                                                        }
                                                        className="mx-auto"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        title="Preview"
                                                        onClick={() => setPreviewing(t)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted"
                                                    >
                                                        <Eye className="size-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-border px-4 py-3 text-[12.5px] text-muted-foreground">
                                Showing {filtered.length} of {templates.length} template{templates.length === 1 ? '' : 's'}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!previewing} onOpenChange={(open) => { if (!open) setPreviewing(null); }}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="break-words">{previewing?.title}</DialogTitle>
                        <DialogDescription className="break-words whitespace-pre-wrap text-foreground">
                            {previewing?.content}
                        </DialogDescription>
                    </DialogHeader>
                    {previewing?.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewing.image_url} alt="" className="mt-1 h-40 w-full rounded-lg object-cover" />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
