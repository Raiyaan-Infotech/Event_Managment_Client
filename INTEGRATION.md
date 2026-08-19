# How to add a module

This panel is a stripped dashboard template wired to the **Event Management admin backend**.
One module — **Event Categories** — is built end to end as the pattern. Copy it.

---

## The five files that matter

| File | What it does |
|---|---|
| `src/lib/api-client.ts` | The **only** place that calls `fetch`. Base URL, cookie auth, error shape. |
| `src/lib/query-provider.tsx` | TanStack Query client, mounted once in `src/app/layout.tsx`. |
| `src/hooks/use-event-categories.ts` | **The template.** List + detail + create + update + status + delete. |
| `src/app/dashboard/(dashboard)/event-categories/page.tsx` | **The template.** Filters, table, dialog form, pagination. |
| `src/lib/navigation.ts` | Sidebar. Unbuilt links fall through to a "coming soon" placeholder. |

---

## Adding a new module in 4 steps

### 1. Copy the hook

```bash
cp src/hooks/use-event-categories.ts src/hooks/use-event-types.ts
```

Change exactly four things at the top:

```ts
const ENDPOINT = '/event-types';          // the backend route
const KEY = ['event-types'] as const;     // React Query cache key
const LABEL = 'Event Type';               // used in toasts
export interface EventType { ... }        // the row shape
```

### 2. Copy the page

```bash
mkdir "src/app/dashboard/(dashboard)/event-types"
cp "src/app/dashboard/(dashboard)/event-categories/page.tsx" \
   "src/app/dashboard/(dashboard)/event-types/page.tsx"
```

Change the hook import, the `<TableHead>` columns, the table cells, and the dialog fields.
The structure — filter bar → table → dialog → pagination — stays as it is.

### 3. Add it to the sidebar

`src/lib/navigation.ts` — the URL must match the folder name.

### 4. Check it

```bash
npx tsc --noEmit
npm run build
```

---

## How auth works here

**This panel has no login screen.** The visitor signs in elsewhere and arrives with the
backend's session cookie already set. Every request sends `credentials: 'include'`.

Two things follow from that:

1. **The backend must allow this origin.** `FRONTEND_URL` in the backend `.env` is a
   comma-separated CORS whitelist. `http://localhost:3005` is already in it — which is why
   `npm run dev` is pinned to **port 3005**. Change the port and every request fails CORS
   before your code sees it.
2. **No cookie means 401.** `ApiError.isAuthError` distinguishes that from a real failure,
   so the hook can say *"Your session has expired"* rather than *"Failed to load"*.

To point at production instead of local, edit `.env.local`:

```
NEXT_PUBLIC_API_URL=https://event-management-admin-backend.onrender.com/api/v1
```

`NEXT_PUBLIC_*` is inlined **at build time**, so a deployed build needs it set before the
build runs, not after.

---

## Backend response shape

Every endpoint returns the same envelope:

```jsonc
{ "success": true, "message": "...", "data": ... }
```

`api-client.ts` unwraps `.data` for you, so hooks deal in the payload directly.
List endpoints put pagination beside the rows:

```jsonc
{ "data": [ ...rows ], "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```

That is the `Paginated<T>` type.

---

## Conventions carried over from the other frontends

These exist because each one was a real bug at some point. Keep them.

| Rule | Why |
|---|---|
| `refetchType: 'all'` on every invalidation | React Query only auto-refetches **mounted** queries. Save on a detail page, go back to the list, and without this you see stale data. |
| `setForm(prev => ...)`, never `{ ...form }` | Any async field (colour picker, upload) writes back a stale snapshot and silently wipes what was typed. |
| One shared `"Please fill all mandatory fields."` toast | Field-specific toasts stack up and repeat what the red borders already say. |
| `break-words` + `line-clamp`, never `truncate` in a table cell | These tables are auto-layout — `truncate` collapses the whole column instead of clipping the text. |
| Skeleton rows, not a bare "Loading..." line | Text-only loading collapses the table, then it jumps when data lands. |
| `is_active` is **three** values | `0` inactive, `1` active, `2` **pending approval**. A pending row gets a badge, not a switch — that status is not the admin's to flip. |
| Debounce search before it hits the query key | Otherwise every keystroke is a network request. |
| Reset to page 1 when a filter changes | Otherwise you land on a page that no longer exists and see an empty table. |

---

## What was removed from the template

Deleted, and recoverable from the first git commit (`chore: baseline`):

- `src/app/api/*` — fake login / register / validate-exists routes
- `src/app/dashboard/(auth)/*` — login, register, reset-password pages
- `src/components/features/auth`, `src/lib/auth-api.ts`, `src/lib/mock-db.ts`
- Demo pages with no backend: `analytics`, `apps/*` (chat, email, tasks, notes, storage,
  calendar), `reports/*`, `event/*`, `authentication/profile-settings`

Kept: the entire `src/components/ui` library (shadcn + Radix), the layout shell
(sidebar, header, breadcrumb, footer), theming, and the `[...slug]` "coming soon" page.

```bash
git show HEAD~1 --stat     # everything that was in the pristine template
git checkout <commit> -- <path>   # bring any of it back
```

---

## Running it

```bash
npm run dev     # http://localhost:3005
```

The backend must be running on `:5001`, and you need a valid session cookie for that
backend in the browser — otherwise the list shows the "Could not load" state with a 401.
