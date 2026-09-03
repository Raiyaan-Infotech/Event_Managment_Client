import { request, type FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Log in once, save the cookie, and fail fast if nothing is running.
 *
 * ── ⚠ IT DOES NOT START ANYTHING ────────────────────────────────────────────
 * Both servers are expected to already be up. If one is not, this throws a
 * sentence saying which — because the alternative is every spec timing out for
 * thirty seconds each and a report that says "everything is broken" when the
 * truth is "nothing was listening".
 *
 * ── WHY THE COOKIE IS FETCHED FROM THE API, NOT THE UI ──────────────────────
 * Driving the login FORM here would make every other spec depend on the login
 * page rendering — so a CSS change on one screen would fail the entire suite
 * for an unrelated reason. The login form gets its own spec instead, where a
 * failure means what it says.
 */
const APP = process.env.E2E_BASE_URL || 'http://localhost:3005';
const API = process.env.E2E_API_URL || 'http://localhost:5001/api/v1';

const CREDENTIALS = {
    email: process.env.E2E_EMAIL || 'test@example.com',
    password: process.env.E2E_PASSWORD || 'Test@123',
};

async function reachable(url: string) {
    try {
        const ctx = await request.newContext({ ignoreHTTPSErrors: true });
        const res = await ctx.get(url, { timeout: 5_000 });
        await ctx.dispose();
        return res.status() > 0;
    } catch {
        return false;
    }
}

export default async function globalSetup(_config: FullConfig) {
    if (!(await reachable(APP))) {
        throw new Error(
            `The client portal is not answering on ${APP}.\n`
            + 'Start it yourself with `npm run dev` in event_client_single — this suite '
            + 'deliberately does not start servers.',
        );
    }
    if (!(await reachable(`${API}/public/website-clients/login`))) {
        throw new Error(
            `The backend is not answering on ${API}.\n`
            + 'Start it yourself in Event_Management_Admin_Backend — this suite '
            + 'deliberately does not start servers.',
        );
    }

    /*
      ⚠ The FULL url, not baseURL + '/path'. A leading slash resolves against
      the ORIGIN, which silently drops the `/api/v1` prefix and 404s — the
      first thing this setup did wrong.
    */
    const ctx = await request.newContext({ ignoreHTTPSErrors: true });
    const res = await ctx.post(`${API}/public/website-clients/login`, { data: CREDENTIALS });

    if (!res.ok()) {
        throw new Error(
            `Login failed (${res.status()}) for ${CREDENTIALS.email}.\n`
            + 'Check the seeded test client still exists, or set E2E_EMAIL / E2E_PASSWORD.',
        );
    }

    /*
      ⚠ The cookie is issued by the API on :5001, but the browser will send it
      to the app on :3005, which proxies. Playwright stores cookies per DOMAIN,
      and both are `localhost` — so the port does not matter here and one saved
      state works for both. This is only true because everything is on
      localhost; it would need revisiting the day staging is tested.
    */
    const state = await ctx.storageState();
    await ctx.dispose();

    const dir = path.join(process.cwd(), '.auth');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify(state, null, 2));

    const names = state.cookies.map((c) => c.name);
    if (!names.some((n) => n.includes('website_client'))) {
        throw new Error(
            `Logged in, but no client session cookie came back. Got: ${names.join(', ') || 'none'}`,
        );
    }
}
