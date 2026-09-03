import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright — the client portal.
 *
 * ── ⚠ THIS CONFIG DOES NOT START A SERVER, AND MUST NOT ─────────────────────
 * There is deliberately no `webServer` block. Jamal runs `npm run dev` himself
 * and keeps it running; a `webServer` entry would either try to start a second
 * one on a taken port, or — worse — run a build against the live `.next` and
 * make the running server return 500s.
 *
 * So the rule is: the dev server must already be up on 3005 before these run.
 * If it is not, the suite fails fast with a readable message rather than
 * spending two minutes timing out on every spec — see `globalSetup`.
 *
 * ── WHY THREE BROWSERS ──────────────────────────────────────────────────────
 * Chromium alone does not earn its runtime here. WebKit is Safari and iOS,
 * which is where sticky positioning, flex-gap and 100vh bugs actually appear;
 * a layout that passes only in Chromium has not been tested for the platform
 * half the guests will open it on.
 *
 * ── ⚠ AUTHENTICATION ────────────────────────────────────────────────────────
 * Every /dashboard route is behind a client session. `globalSetup` logs in ONCE
 * against the API and saves the cookie to `.auth/state.json`, which every
 * project reuses. Logging in per spec would be dozens of round trips and would
 * make the suite fail as one when the login route hiccups, hiding what actually
 * broke.
 */
export default defineConfig({
    testDir: './e2e',
    /* A page that is slow is a finding; a page that never answers is a hang. */
    timeout: 30_000,
    expect: { timeout: 7_000 },

    /* CI-style strictness locally too: a `.only` left in a commit silently
       stops running everything else. */
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,

    /*
      Serial by default. The specs share ONE client account and the same guest
      rows; running them in parallel means one spec editing an RSVP while
      another asserts on it, and the failure that produces is unreproducible.
      Raise this only for specs that are provably read-only.
    */
    workers: 1,
    fullyParallel: false,

    reporter: [
        ['list'],
        ['html', { outputFolder: 'e2e-report', open: 'never' }],
    ],

    use: {
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:3005',
        storageState: '.auth/state.json',
        /* Evidence, not vibes: a failure that cannot be looked at is a failure
           somebody will argue about. Kept only for failures so the folder does
           not fill up on a green run. */
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        /* The dev server is local and unencrypted; nothing here should be
           reaching an https origin anyway. */
        ignoreHTTPSErrors: true,
    },

    globalSetup: './e2e/global-setup.ts',

    /*
      The four widths the QA brief names, plus two real engines.

      They are separate PROJECTS rather than a loop inside one spec so a
      failure names the viewport it happened at — "guest profile overflows"
      is not actionable, "guest profile overflows at 375px in WebKit" is.
    */
    projects: [
        {
            name: 'mobile-375',
            use: { ...devices['iPhone SE'], viewport: { width: 375, height: 812 } },
        },
        {
            name: 'tablet-768',
            use: { ...devices['iPad Mini'], viewport: { width: 768, height: 1024 } },
        },
        {
            name: 'laptop-1366',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
        },
        {
            name: 'desktop-1920',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
        },
        {
            /* Safari / iOS. The one most likely to find something. */
            name: 'webkit-1366',
            use: { ...devices['Desktop Safari'], viewport: { width: 1366, height: 768 } },
        },
        {
            name: 'firefox-1366',
            use: { ...devices['Desktop Firefox'], viewport: { width: 1366, height: 768 } },
        },
    ],
});
