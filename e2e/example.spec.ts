import { test, expect } from "@playwright/test";

test("has title and localized content", async ({ page }) => {
  await page.goto("/");
  // Next-intl client router will redirect to /en/
  await expect(page).toHaveURL(/\/en\//);
  await expect(page.locator("h1")).toContainText("Welcome to Base Project");
});

test("loads and renders the dynamic dashboard metrics", async ({ page }) => {
  await page.goto("/en/");
  // Verify that the Dashboard component header is visible
  await expect(page.locator("h2")).toContainText("Live System Monitor");

  // Verify the metrics are displayed
  await expect(page.locator("text=Active Sessions")).toBeVisible();
  await expect(page.locator("text=Response Time")).toBeVisible();
  await expect(page.locator("text=CPU Workload")).toBeVisible();
  await expect(page.locator("text=System Status")).toBeVisible();
});
