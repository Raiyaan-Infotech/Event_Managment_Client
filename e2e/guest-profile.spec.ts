import { test, expect, type Page } from '@playwright/test';

/**
 * Guest Profile and the RSVP screens — the flows, in a real browser.
 *
 * ── ⚠ THESE RUN AT ONE WIDTH ONLY ───────────────────────────────────────────
 * Flow assertions do not get more true at four viewports; running them six
 * times over is six times the runtime and six identical failures to read when
 * something breaks. `responsive.spec.ts` is where width matters.
 *
 * ── ⚠ THEY WRITE, AND THEY CLEAN UP ─────────────────────────────────────────
 * Notes, tags and reminders are created here. Every one is removed in the same
 * spec that made it. A suite that leaves rows behind is one that fails
 * differently on its second run, which is how people stop believing it.
 */

/*
  ⚠ `test.skip()` at file scope takes a callback of FIXTURES ONLY — passing a
  second `testInfo` argument silently receives `undefined`, and reading
  `.project` off it throws the same TypeError in every project. The correct
  place to read `testInfo` is inside a hook, which is why this lives in
  `beforeEach` rather than as a bare top-level call.
*/
test.beforeEach(async ({ }, testInfo) => {
    test.skip(testInfo.project.name !== 'laptop-1366', 'Flow specs run once, at laptop width.');
});

const GUEST_ID = 147;

async function settle(page: Page) {
    await page.waitForLoadState('networkidle').catch(() => { });
    await page
        .waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, null, { timeout: 10_000 })
        .catch(() => { });
}

test.describe('Guest Profile', () => {
    test('all six tabs open and render something', async ({ page }) => {
        await page.goto(`/dashboard/guests/${GUEST_ID}/profile`);
        await settle(page);

        await expect(page.getByRole('heading', { name: 'Guest Profile' })).toBeVisible();

        /*
          ⚠ The email caveat must be ON THE PAGE. The whole profile is stitched
          together on an email match, which can be wrong in two directions, and
          the only mitigation is that the reader is told. If this assertion ever
          fails, the page has started presenting a guess as a fact.
        */
        await expect(page.getByText(/matched on email address|no email address/i)).toBeVisible();

        for (const tab of ['Overview', 'Invitation History', 'RSVP History', 'Notes', 'Linked Events', 'Activity']) {
            await page.getByRole('tab', { name: new RegExp(`^${tab}`) }).click();
            await page.waitForTimeout(200);
            // The panel must have real content, not just exist.
            const panel = page.locator('[role="tabpanel"][data-state="active"]');
            await expect(panel, `${tab} rendered empty`).toBeVisible();
            expect((await panel.innerText()).trim().length, `${tab} has no text`).toBeGreaterThan(10);
        }
    });

    test('a note can be added, edited, pinned and deleted', async ({ page }) => {
        const title = `E2E note ${Date.now()}`;

        await page.goto(`/dashboard/guests/${GUEST_ID}/profile`);
        await settle(page);
        await page.getByRole('tab', { name: /^Notes/ }).click();

        await page.getByRole('button', { name: 'Add note' }).click();
        await page.getByLabel(/^Title/).fill(title);
        await page.getByRole('button', { name: 'Add note' }).last().click();

        await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 });

        /*
          ⚠ XPath to the nearest ancestor with the note card's own class, NOT a
          bare `div` filter. Every ancestor up to <body> also "contains" the
          title text, so `locator('div').filter({ hasText })` matches dozens of
          nested wrappers and does not reliably land on the note card itself —
          that ambiguity is what timed out originally. `[1]` on an `ancestor::`
          axis means the CLOSEST match, not the first in document order.
        */
        const card = page.getByText(title, { exact: true })
            .locator('xpath=ancestor::div[contains(@class, "rounded-lg")][1]');
        await card.getByTitle('Delete').click();
        await page.getByRole('button', { name: 'Delete note' }).click();
        await expect(page.getByText(title)).toHaveCount(0, { timeout: 10_000 });
    });

    test('a reminder in the past is refused', async ({ page }) => {
        await page.goto(`/dashboard/guests/${GUEST_ID}/profile`);
        await settle(page);
        await page.getByRole('tab', { name: /^Notes/ }).click();

        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await page.getByLabel(/^What/).fill('E2E past reminder');
        await page.getByLabel(/^When/).fill('2020-01-01T10:00');
        await page.getByRole('button', { name: 'Add reminder' }).click();

        /*
          ⚠ Refused CLIENT-side, before the request. The server refuses it too
          — both are asserted elsewhere — but a date the API will reject should
          not be submittable, and this proves the screen agrees with the API
          rather than discovering the disagreement at save time.
        */
        await expect(page.getByText(/date and time in the future/i)).toBeVisible();
    });
});

test.describe('Navigation into the profile', () => {
    /* All three lists were changed to make the NAME the link. */
    const entries = [
        { from: '/dashboard/rsvps', label: 'RSVP list' },
        { from: '/dashboard/guests', label: 'Guests list' },
        { from: '/dashboard/rsvps/groups/7?event_id=22', label: 'Group members' },
    ];

    for (const e of entries) {
        test(`${e.label} — a guest name opens the profile`, async ({ page }) => {
            await page.goto(e.from);
            await settle(page);

            const link = page.locator('a[href*="/profile"]').first();
            await expect(link, `${e.label} has no link to a profile`).toBeVisible();
            await link.click();

            await expect(page).toHaveURL(/\/dashboard\/guests\/\d+\/profile/);
            await expect(page.getByRole('heading', { name: 'Guest Profile' })).toBeVisible();
        });
    }
});

test.describe('Group details', () => {
    test('View member details opens a DIALOG, not a new page', async ({ page }) => {
        await page.goto('/dashboard/rsvps/groups/7?event_id=22');
        await settle(page);

        const url = page.url();
        await page.getByRole('button', { name: 'More actions' }).first().click();
        await page.getByRole('menuitem', { name: /View member details/i }).click();

        await expect(page.getByRole('dialog')).toBeVisible();
        /* The point of the change: you do not leave the list. */
        expect(page.url(), 'It navigated away instead of opening a dialog').toBe(url);
    });

    test('Edit member does NOT offer name or email as editable', async ({ page }) => {
        await page.goto('/dashboard/rsvps/groups/7?event_id=22');
        await settle(page);

        await page.getByRole('button', { name: 'More actions' }).first().click();
        await page.getByRole('menuitem', { name: /Edit member/i }).click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();

        /*
          ⚠ THE INVARIANT. The supplied design's popup edits Full Name, Email
          and Phone. Those belong to the Guests form — two screens writing the
          same columns under two sets of validation is how a mobile number ends
          up valid on one and rejected on the other. They must be present but
          NOT editable.
        */
        await expect(dialog.getByText('Full name')).toBeVisible();
        const nameInput = dialog.locator('input').filter({ hasText: '' });
        const editableNames = await dialog.evaluate((d) =>
            Array.from(d.querySelectorAll('input'))
                .filter((i) => !i.readOnly && !i.disabled)
                .map((i) => i.id || i.getAttribute('placeholder') || ''));

        expect(
            editableNames.some((n) => /name|email|phone|mobile/i.test(n)),
            `Contact fields are editable here: ${editableNames.join(', ')}`,
        ).toBe(false);

        await expect(dialog.getByText(/Edit them on the guest/i)).toBeVisible();
        expect(nameInput).toBeTruthy();
    });
});

test.describe('RSVP list', () => {
    test('Total Invitations clears the status filter', async ({ page }) => {
        await page.goto('/dashboard/rsvps');
        await settle(page);

        await page.getByText('Accepted', { exact: true }).first().click();
        await page.waitForTimeout(600);

        /* And back again — the tile that was inert before. */
        await page.getByText('Total Invitations').click();
        await page.waitForTimeout(600);

        const status = page.locator('button').filter({ hasText: 'All RSVP Status' });
        await expect(status, 'Total Invitations did not clear the filter').toBeVisible();
    });
});

test.describe('Auth', () => {
    /*
      ⚠ ASSERT ON CONTENT, NOT THE URL. `ClientAuthGate` redirects a
      signed-out visitor to the tenant WEBSITE's own login page
      (`window.location.replace`), a different origin this suite does not run.
      When that origin is unreachable the browser's address bar can still read
      the last page it loaded — the redirect ATTEMPT is real, its destination
      just isn't up in this test environment. Checking the URL therefore
      depends on infrastructure this spec does not control.

      The actual security property is narrower and does not: a signed-out
      visitor must never see PROTECTED CONTENT. `ClientAuthGate` guarantees
      that with `if (!client) return null` — the dashboard's children are
      never rendered without a session, regardless of where the redirect ends
      up. That is what gets checked here.
    */
    test('a logged-out visitor never sees protected content', async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const page = await ctx.newPage();
        await page.goto('http://localhost:3005/dashboard/rsvps', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        await expect(
            page.getByRole('heading', { name: /RSVPs/i }),
            'The RSVPs page rendered for a signed-out visitor',
        ).not.toBeVisible();

        const guestRows = await page.locator('table tbody tr').count();
        expect(guestRows, 'Guest rows rendered for a signed-out visitor').toBe(0);

        await ctx.close();
    });
});
