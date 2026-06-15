import { test, expect } from "@playwright/test";

// End-to-end happy path (demo mode): a new user signs up, completes onboarding,
// logs a footprint, and lands on a dashboard that actually shows their data.
// This is the flow that previously regressed (footprint saved but didn't show).
test("signup → onboarding → track → dashboard shows the footprint & insight", async ({ page }) => {
  await page.goto("/signup");

  await page.getByLabel("Full name").fill("E2E Tester");
  await page.getByLabel("Email").fill(`e2e_${Date.now()}@prithvi.test`);
  await page.getByLabel("Password", { exact: true }).fill("secret123");
  await page.getByRole("button", { name: "Create account" }).click();

  // Onboarding (personal details)
  await expect(page).toHaveURL(/\/app\/profile/);
  await page.getByLabel(/City/).fill("Pune");
  await page.getByLabel(/State/).selectOption("Maharashtra");
  await page.getByRole("button", { name: /Save & continue/ }).click();

  // Tracking questionnaire (defaults are pre-filled)
  await expect(page).toHaveURL(/\/app\/track/);
  await page.getByRole("button", { name: /Save & see insights/ }).click();

  // Dashboard reflects the saved footprint + an insight (not the empty state)
  await expect(page).toHaveURL(/\/app\/dashboard/);
  await expect(page.getByText("Annual footprint")).toBeVisible();
  await expect(page.getByText("Your insight")).toBeVisible();
  await expect(page.getByText("Let's measure your footprint")).toHaveCount(0);
});

test("community: a posted step appears in the feed", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Community Tester");
  await page.getByLabel("Email").fill(`e2ec_${Date.now()}@prithvi.test`);
  await page.getByLabel("Password", { exact: true }).fill("secret123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/app\/profile/);
  await page.getByLabel(/City/).fill("Pune");
  await page.getByLabel(/State/).selectOption("Maharashtra");
  await page.getByRole("button", { name: /Save & continue/ }).click();

  await page.goto("/app/community");
  const msg = "Switched to LED bulbs across the house";
  await page.getByLabel(/Share a step/).fill(msg);
  await page.getByRole("button", { name: /^Post$/ }).click();

  await expect(page.getByText(msg)).toBeVisible();
});
