# Event Management — Client Portal

The signed-in portal for people who registered on an Event Management website.
They create events here, manage their guest list, send invitations and see how
the responses are going.

It is a Next.js app that talks **directly** to the Event Management admin
backend — there is no API route layer of its own. See `INTEGRATION.md` for the
data contract.

| | |
|---|---|
| Local | `npm run dev` → http://localhost:3005 |
| Backend | https://event-management-admin-backend.onrender.com |
| Node | 20+ |

```bash
npm install
cp .env.example .env.local     # then edit it
npm run dev
```

---

## Environment

Two variables, both listed in [`.env.example`](.env.example).

| Variable | Local | Live |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5001/api/v1` | `https://event-management-admin-backend.onrender.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3010` | `https://event-managment-public-website.vercel.app` |

Three things that are not obvious and each cost real time:

1. **`NEXT_PUBLIC_API_URL` must include `/api/v1`.** Without it every call 404s
   and nothing else looks wrong.
2. **Both are `NEXT_PUBLIC_`, so they are inlined into the browser bundle at
   BUILD time.** Changing them in Vercel does nothing until you redeploy. It
   also means neither may ever hold a secret — anyone can read them in
   devtools.
3. **`NEXT_PUBLIC_SITE_URL` is the tenant's WEBSITE, not this portal.** It is
   where an unauthenticated visitor is sent to sign in and where Log out
   returns them. Pointing it at this portal loops forever. If unset, the code
   falls back to the live builder site rather than nowhere.

---

## Deploying

### 1. Deploy the app

Import the repository on Vercel. Framework preset **Next.js**; the defaults are
correct. Set both variables above under *Settings → Environment Variables*
before the first build, since they are baked in at build time.

### 2. Allow the new origin on the backend — **required**

The portal calls the backend cross-origin and sends its session cookie with
every request (`credentials: 'include'`). The backend only reflects an origin
that is named in its own `FRONTEND_URL`, so until the deployed URL is added
there, **every authenticated request fails CORS** — the login screen appears to
work and nothing after it does.

On the backend host (Render), append the portal's origin to `FRONTEND_URL`:

```
FRONTEND_URL=https://adminpanelfrontend-nine.vercel.app,https://event-management-vendor-frontend.vercel.app,https://event-management-admin-frontend.vercel.app,https://<this-deployment>.vercel.app
```

Comma-separated, no spaces, no trailing slash, and the scheme must match
exactly. Then redeploy the backend so it re-reads the variable.

> This is not hypothetical — the same misconfiguration silently broke client
> signup on live once already.

### 3. Cookies

The session cookie is issued by the backend as `SameSite=None; Secure`, which
is what a cross-site cookie requires. Both ends must therefore be HTTPS —
Vercel and Render both are, so there is nothing to configure. It does mean the
portal **cannot** be served over plain HTTP anywhere except localhost.

---

## Routes

```
/dashboard                     overview
/dashboard/events              My Events · create · detail · edit
/dashboard/guests              list · add · edit · groups · CSV import
/dashboard/templates           the invitation catalogue
/dashboard/analytics           events, RSVP and messaging aggregates
/dashboard/profile             account
```

## Invitation templates

An event stores its design in `events.theme_id`, and that column holds **either**
kind of id:

- a `code` from the admin panel's Templates module — the real catalogue; or
- an id from `src/lib/event-themes.ts`, the built-in list used before that
  module existed, and still the fallback when nothing is published.

`resolveArtwork()` in `src/lib/event-templates.ts` resolves either, so an event
created before the admin catalogue keeps exactly the artwork it had.

> ⚠ **Never rename a template `code`, and never rename an id in
> `event-themes.ts`.** Events store the string. A rename silently orphans every
> event using it and their invitation quietly changes design, with no error
> anywhere.

## What is not built

Messaging (Send Message and the Messages list) is **paused by decision**, not
missing by accident. The tables, models and read path all exist; the write path
does not, and there is no scheduler to fire a scheduled campaign. Those nav
entries render disabled rather than linking to a dead end.
