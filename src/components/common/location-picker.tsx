"use client";

import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, Pencil, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/**
 * Country / state / city / PIN code, chosen from the admin's Locations tables
 * instead of typed (Jamal, 2026-10-05) — the same lists, and the same rules,
 * as the mobile app's guest form.
 *
 * The four levels are country → state → district → city, and the table names
 * are one step off the words on screen: a `districts` row is what a form calls
 * the CITY ("Chennai"), and a `cities` row is a locality with its PIN code
 * ("Adyar (Chennai)", 600020).
 *
 * ── THE WHOLE LIST, A PAGE AT A TIME ────────────────────────────────────────
 * One state holds up to 2,919 cities and one city up to 7,016 PIN code rows.
 * Nothing is cut off: the picker loads PAGE_SIZE rows and fetches the next
 * page when the list is scrolled to its end. Typing searches the whole table
 * on the server, not just the rows on screen. Pages are cached for the
 * session, so reopening a list costs no request.
 *
 * The guest still stores the four as TEXT (the names), so nothing changes on
 * the server. A value the tables do not hold can still be entered — the list
 * offers `Use "<what was typed>"` — because only 36 countries have PIN code
 * rows and an older guest may carry a name spelt differently.
 */

export interface LocationRow {
    id: number;
    name: string;
    pincode?: string | null;
}

const PAGE_SIZE = 100;

const LIST_QUERY = { limit: PAGE_SIZE, sort_by: "name", sort_order: "asc", is_active: 1 } as const;

export const locationPaths = {
    countries: () => "/locations/countries",
    states: (countryId: number) => `/locations/states/${countryId}`,
    cities: (stateId: number) => `/locations/districts/${stateId}`,
    pincodes: (cityId: number) => `/locations/cities/${cityId}`,
};

/**
 * The table id behind a NAME on screen. An edit starts with names only, so the
 * list below a field needs its parent looked up; a row picked in this session
 * hands its id over directly ([known]) and costs no request.
 */
export function useLocationId(path: string | null, name: string, known: number | null) {
    const wanted = name.trim().toLowerCase();
    const lookup = useQuery({
        queryKey: ["locations", "id", path, wanted],
        queryFn: async () => {
            const res = await api.getList<LocationRow>(path!, { ...LIST_QUERY, search: name.trim(), limit: 50 });
            return res.data.find((r) => r.name.trim().toLowerCase() === wanted)?.id ?? null;
        },
        enabled: !!path && !!wanted && known === null,
        staleTime: Infinity,
        retry: false,
    });
    return known ?? lookup.data ?? null;
}

export function LocationPicker({
    value,
    placeholder,
    path,
    needs,
    onPick,
    showPincode = false,
    searchPlaceholder = "Search",
}: {
    /** What the guest holds — the name, or the PIN code. */
    value: string;
    placeholder: string;
    /** The list to read. Null = the field above has no row in the tables. */
    path: string | null;
    /** Shown instead of a list when the field above is still empty. */
    needs?: string | null;
    /** `id` is 0 when the typed text was used as is. */
    onPick: (row: LocationRow) => void;
    /** A PIN code row: the code is the value, the locality its second line. */
    showPincode?: boolean;
    searchPlaceholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState("");
    const [search, setSearch] = useState("");

    // The request follows the typing a moment behind, so a fast typist sends
    // one request rather than one per letter.
    useEffect(() => {
        const t = setTimeout(() => setSearch(typed.trim()), 250);
        return () => clearTimeout(t);
    }, [typed]);

    const list = useInfiniteQuery({
        queryKey: ["locations", "list", path, search.toLowerCase()],
        queryFn: ({ pageParam }) =>
            api.getList<LocationRow>(path!, { ...LIST_QUERY, search, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (last) => (last.pagination?.hasNextPage ? last.pagination.page + 1 : undefined),
        enabled: open && !!path,
        staleTime: Infinity,
        retry: false,
    });

    const rows = list.data?.pages.flatMap((p) => p.data) ?? [];
    const total = list.data?.pages[0]?.pagination?.totalItems ?? rows.length;
    const label = (r: LocationRow) => (showPincode ? r.pincode || r.name : r.name);
    const text = typed.trim();
    const offerTyped =
        !!text && !list.isFetching && !rows.some((r) => label(r).toLowerCase() === text.toLowerCase());

    const pick = (row: LocationRow) => {
        onPick(row);
        setOpen(false);
        setTyped("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-left text-[13px] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <span className={cn("min-w-0 truncate", !value && "text-muted-foreground")}>
                        {value || placeholder}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0">
                {needs ? (
                    <p className="px-3 py-6 text-center text-[12.5px] text-muted-foreground">{needs}</p>
                ) : (
                    <>
                        <div className="flex items-center gap-2 border-b border-border px-3">
                            <Search className="size-4 shrink-0 text-muted-foreground" />
                            <input
                                autoFocus
                                value={typed}
                                onChange={(e) => setTyped(e.target.value.slice(0, 120))}
                                placeholder={searchPlaceholder}
                                className="h-10 w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                            />
                            {list.isFetching && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
                            {!list.isFetching && total > 0 && (
                                <span className="shrink-0 text-[11px] text-muted-foreground">
                                    {rows.length} of {total}
                                </span>
                            )}
                        </div>
                        <ul
                            className="max-h-64 overflow-y-auto py-1"
                            // Near the end of what is loaded: fetch the next page.
                            onScroll={(e) => {
                                const el = e.currentTarget;
                                if (
                                    el.scrollHeight - el.scrollTop - el.clientHeight < 200 &&
                                    list.hasNextPage && !list.isFetchingNextPage
                                ) {
                                    list.fetchNextPage();
                                }
                            }}
                        >
                            {rows.map((r) => (
                                <li key={r.id}>
                                    <button
                                        type="button"
                                        onClick={() => pick(r)}
                                        className="flex w-full flex-col items-start px-3 py-2 text-left text-[13px] hover:bg-accent"
                                    >
                                        <span className="break-words">{label(r)}</span>
                                        {showPincode && r.pincode && (
                                            <span className="break-words text-[11.5px] text-muted-foreground">{r.name}</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                            {list.isFetchingNextPage && (
                                <li className="flex justify-center py-2">
                                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                </li>
                            )}
                            {offerTyped && (
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => pick({ id: 0, name: text, pincode: showPincode ? text : null })}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-primary hover:bg-accent"
                                    >
                                        <Pencil className="size-3.5 shrink-0" />
                                        <span className="break-words">Use &ldquo;{text}&rdquo;</span>
                                    </button>
                                </li>
                            )}
                            {!list.isFetching && rows.length === 0 && !offerTyped && (
                                <li className="px-3 py-6 text-center text-[12.5px] text-muted-foreground">
                                    {list.isError ? "Could not load the list." : "Nothing to show. Type to search."}
                                </li>
                            )}
                        </ul>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}
