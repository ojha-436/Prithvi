import { test, expect } from "@playwright/test";

// Negative-path auth tests — verify that invalid input is caught before submission
// and that server-side errors surface clearly to the user.

test("login: shows error for an invalid email format", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Password", { exact: true }).fill("anypassword");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("valid email");
  await expect(page).toHaveURL(/\/login/);
});

test("login: shows error when signing in with a wrong password", async ({ page }) => {
  // First create an account
  await page.goto("/signup");
  const email = `wrong-pw_${Date.now()}@prithvi.test`;
  await page.getByLabel("Full name").fill("Wrong PW Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("correctpass");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/app\/profile/);

  // Sign out by navigating to login directly (demo mode has no sign-out button in scope here)
  // Clear localStorage to simulate a fresh session
  await page.evaluate(() => {
    localStorage.removeItem("prithvi.demo.session");
  });
  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("wrongpassword");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Invalid email or password");
  await expect(page).toHaveURL(/\/login/);
});

test("signup: shows error when name is too short", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("A");
  await page.getByLabel("Email").fill("valid@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("name");
  await expect(page).toHaveURL(/\/signup/);
});

test("signup: shows error when email is malformed", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Valid Name");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("valid email");
  await expect(page).toHaveURL(/\/signup/);
});

test("signup: shows error when password is too short", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Valid Name");
  await page.getByLabel("Email").fill("valid@example.com");
  await page.getByLabel("Password", { exact: true }).fill("abc");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("6 characters");
  await expect(page).toHaveURL(/\/signup/);
});
