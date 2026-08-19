'use client';

/**
 * ── SAMPLE MODULE ────────────────────────────────────────────────────────────
 * Event Categories — list, filter, paginate, create, edit, toggle, delete.
 *
 * This page exists to show how a module is integrated end to end. Copy it for
 * the next module and change the hook import, the columns and the form fields;
 * the structure below (filter bar -> table -> dialog -> pagination) stays.
 *
 * See INTEGRATION.md at the repo root for the step-by-step.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faSearch,
    faPenToSquare,
    faTrash,
    faTriangleExclamation,
    faLayerGroup,
    faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    useEventCategories,
    useCreateEventCategory,
    useUpdateEventCategory,
    useUpdateEventCategoryStatus,
    useDeleteEventCategory,
    type EventCategory,
} from '@/hooks/use-event-categories';

const PAGE_SIZE = 10;

const EMPTY_FORM = { name: '', description: '', color: '#6366F1', sort_order: 0, is_active: true };
type FormState = typeof EMPTY_FORM;

export default function EventCategoriesPage() {
    // ── filters ──────────────────────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [page, setPage] = useState(1);

    // Debounced so typing does not fire a request per keystroke.
    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    // Any filter change must reset to page 1, or you can land on a page that
    // no longer exists in the filtered result and see an empty table.
    useEffect(() => { setPage(1); }, [debounced, status]);

    const { data, isLoading, isError, error, refetch, isFetching } = useEventCategories({
        search: debounced,
        is_active: status === 'all' ? '' : Number(status),
        page,
        limit: PAGE_SIZE,
    });

    const rows = useMemo(() => data?.data ?? [], [data]);
    const pagination = data?.pagination;
    const hasFilters = debounced !== '' || status !== 'all';

    // ── form dialog ──────────────────────────────────────────────────────────
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<EventCategory | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    // Functional updater, never { ...form } — an async change (a picker, an
    // upload) would otherwise write back a stale snapshot of the whole form.
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => (prev[key as string] ? { ...prev, [key]: false } : prev));
    };

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setErrors({});
        setOpen(true);
    };

    const openEdit = (row: EventCategory) => {
        setEditing(row);
        setForm({
            name: row.name ?? '',
            description: row.description ?? '',
            color: row.color || '#6366F1',
            sort_order: row.sort_order ?? 0,
            is_active: Number(row.is_active) === 1,
        });
        setErrors({});
        setOpen(true);
    };

    const createRow = useCreateEventCategory(() => setOpen(false));
    const updateRow = useUpdateEventCategory(() => setOpen(false));
    const toggleRow = useUpdateEventCategoryStatus();
    const deleteRow = useDeleteEventCategory();

    const isSaving = createRow.isPending || updateRow.isPending;
    const isBusy = isSaving || toggleRow.isPending || deleteRow.isPending;

    const handleSave = () => {
        const next: Record<string, boolean> = {};
        if (!form.name.trim()) next.name = true;

        if (Object.keys(next).length) {
            setErrors(next);
            // One shared message, never a field-specific toast — the red borders
            // already say which field.
            toast.error('Please fill all mandatory fields.');
            return;
        }

        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || null,
            color: form.color,
            sort_order: Number(form.sort_order) || 0,
            is_active: form.is_active ? 1 : 0,
        };

        if (editing) updateRow.mutate({ id: editing.id, data: payload });
        else createRow.mutate(payload);
    };

    // ── delete confirm ───────────────────────────────────────────────────────
    const [pendingDelete, setPendingDelete] = useState<EventCategory | null>(null);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="min-w-0">
                    <h1 className="text-xl font-black tracking-tight text-foreground">Event Categories</h1>
                    <p className="text-[13px] text-muted-foreground mt-1">
                        The top level of the event taxonomy. Types and religions sit underneath.
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[13px] px-6 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2 h-3.5 w-3.5" />
                    Add Category
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm bg-card">
                <CardContent className="p-5 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 min-w-0">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                        />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search categories..."
                            className="h-11 rounded-xl pl-10"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-11 w-full sm:w-[190px] rounded-xl">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                            <SelectItem value="2">Pending Approval</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button
                            variant="outline"
                            onClick={() => { setSearch(''); setStatus('all'); }}
                            className="h-11 rounded-xl font-bold text-[13px]"
                        >
                            <FontAwesomeIcon icon={faRotateRight} className="mr-2 h-3.5 w-3.5" />
                            Reset
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-none shadow-sm bg-card overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14">#</TableHead>
                                    <TableHead className="min-w-[200px]">Name</TableHead>
                                    <TableHead className="min-w-[240px]">Description</TableHead>
                                    <TableHead className="w-28 text-center">Order</TableHead>
                                    <TableHead className="w-32 text-center">Status</TableHead>
                                    <TableHead className="w-28 text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    // Skeleton rows rather than a bare "Loading..." line, so the
                                    // table does not collapse and then jump when data lands.
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={`sk-${i}`}>
                                            {Array.from({ length: 6 }).map((__, j) => (
                                                <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-16 text-center">
                                            <FontAwesomeIcon icon={faTriangleExclamation} className="h-7 w-7 text-amber-500 mb-3" />
                                            <p className="text-sm font-bold text-foreground">Could not load categories</p>
                                            <p className="text-[13px] text-muted-foreground mt-1">
                                                {error instanceof Error ? error.message : 'Unknown error'}
                                            </p>
                                            <Button variant="outline" onClick={() => refetch()} className="mt-4 h-9 rounded-lg text-[13px] font-bold">
                                                Try again
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ) : rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-16 text-center">
                                            <FontAwesomeIcon icon={faLayerGroup} className="h-7 w-7 text-muted-foreground/50 mb-3" />
                                            <p className="text-sm font-bold text-foreground">
                                                {hasFilters ? 'No categories match these filters' : 'No categories yet'}
                                            </p>
                                            <p className="text-[13px] text-muted-foreground mt-1">
                                                {hasFilters ? 'Try clearing the search or status filter.' : 'Click "Add Category" to create the first one.'}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row, index) => {
                                        const pending = Number(row.is_active) === 2;
                                        return (
                                            <TableRow key={row.id}>
                                                <TableCell className="text-muted-foreground text-[13px]">
                                                    {(page - 1) * PAGE_SIZE + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <span
                                                            className="h-2.5 w-2.5 rounded-full shrink-0 border border-border"
                                                            style={{ backgroundColor: row.color || 'transparent' }}
                                                        />
                                                        {/* break-words + a max width, never `truncate` —
                                                            this table is auto-layout and truncate
                                                            collapses the column instead of clipping. */}
                                                        <span className="text-[13px] font-bold text-foreground break-words">
                                                            {row.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-[13px] text-muted-foreground break-words line-clamp-2 max-w-[320px] block">
                                                        {row.description || '—'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-[13px] tabular-nums text-muted-foreground">
                                                    {row.sort_order}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {pending ? (
                                                        // Pending approval is not the admin's to flip —
                                                        // a switch here would imply it is.
                                                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-[10px] font-bold dark:bg-amber-950/40">
                                                            Pending
                                                        </Badge>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Switch
                                                                checked={Number(row.is_active) === 1}
                                                                disabled={toggleRow.isPending}
                                                                onCheckedChange={(v) => toggleRow.mutate({ id: row.id, is_active: v })}
                                                            />
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {Number(row.is_active) === 1 ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            onClick={() => openEdit(row)}
                                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                                                            aria-label={`Edit ${row.name}`}
                                                        >
                                                            <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            onClick={() => setPendingDelete(row)}
                                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                                                            aria-label={`Delete ${row.name}`}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
                            <p className="text-[13px] text-muted-foreground">
                                Page <span className="font-bold text-foreground">{pagination.page}</span> of{' '}
                                <span className="font-bold text-foreground">{pagination.totalPages}</span>
                                <span className="hidden sm:inline"> · {pagination.totalItems} total</span>
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline" size="sm"
                                    disabled={page <= 1 || isFetching}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="h-9 rounded-lg text-[13px] font-bold"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    disabled={page >= pagination.totalPages || isFetching}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="h-9 rounded-lg text-[13px] font-bold"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create / Edit dialog */}
            <Dialog open={open} onOpenChange={(v) => { if (!isSaving) setOpen(v); }}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
                        <DialogDescription>
                            {editing ? `Update "${editing.name}".` : 'Create a new event category.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setField('name', e.target.value.slice(0, 100))}
                                placeholder="e.g. Wedding"
                                className={cn('h-11 rounded-xl', errors.name && 'border-destructive')}
                            />
                            {errors.name && <p className="text-[12px] text-destructive">Name is required.</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setField('description', e.target.value)}
                                placeholder="What kind of events fall under this category?"
                                className="min-h-[90px] rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="color">Colour</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="color"
                                        type="color"
                                        value={form.color}
                                        onChange={(e) => setField('color', e.target.value)}
                                        className="h-11 w-14 cursor-pointer rounded-xl border border-border bg-transparent p-1"
                                    />
                                    <Input
                                        value={form.color}
                                        onChange={(e) => setField('color', e.target.value)}
                                        className="h-11 rounded-xl font-mono text-[13px]"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="sort">Sort Order</Label>
                                <Input
                                    id="sort"
                                    type="number"
                                    min={0}
                                    value={form.sort_order}
                                    onChange={(e) => setField('sort_order', Number(e.target.value))}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-border px-4 h-11">
                            <Switch checked={form.is_active} onCheckedChange={(v) => setField('is_active', v)} />
                            <span className="text-[13px] text-muted-foreground">
                                {form.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving} className="h-11 rounded-xl font-bold text-[13px]">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="h-11 rounded-xl font-black text-[13px] px-6">
                            {isSaving ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm — never delete straight from a row click. */}
            <Dialog open={!!pendingDelete} onOpenChange={(v) => { if (!v) setPendingDelete(null); }}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Delete category?</DialogTitle>
                        <DialogDescription>
                            &ldquo;{pendingDelete?.name}&rdquo; will be removed. Event types and religions
                            underneath it are deleted with it. This cannot be undone from here.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPendingDelete(null)} className="h-11 rounded-xl font-bold text-[13px]">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleteRow.isPending}
                            onClick={() => {
                                if (!pendingDelete) return;
                                deleteRow.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) });
                            }}
                            className="h-11 rounded-xl font-black text-[13px] px-6"
                        >
                            {deleteRow.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Blocks interaction while a mutation is in flight. */}
            {isBusy && <div className="fixed inset-0 z-[9998] cursor-wait" aria-hidden />}
        </div>
    );
}
