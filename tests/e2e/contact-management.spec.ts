import { test, expect } from "@playwright/test";

test.describe("Contact Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the contacts list", async ({ page }) => {
    await expect(page.locator("#sidebar")).toBeVisible();
    await expect(page.locator("#sidebar nav")).toBeVisible();
  });

  test("should create a new contact", async ({ page }) => {
    await page.click('button:has-text("New")');

    // Should be redirected to edit page
    await page.waitForURL(/\/contacts\/\d+\/edit/);

    await page.fill('input[name="first"]', "John");
    await page.fill('input[name="last"]', "Doe");
    await page.fill('input[name="twitter"]', "johndoe");
    await page.fill('textarea[name="notes"]', "Test contact notes");

    await page.click('button:has-text("Save")');

    // Should be redirected to contact detail page
    await page.waitForURL(/\/contacts\/\d+$/);
    await expect(page.locator("#detail h1")).toContainText("John Doe");
    await expect(page.locator("#detail")).toContainText("johndoe");
    await expect(page.locator("#detail")).toContainText("Test contact notes");
  });

  test("should search for contacts", async ({ page }) => {
    await page.fill('input[name="q"]', "contact");

    await page.waitForLoadState("networkidle");
    await expect(page.locator("#sidebar nav")).toBeVisible();
  });

  test("should edit a contact", async ({ page }) => {
    // Create a contact first
    await page.click('button:has-text("New")');
    await page.waitForURL(/\/contacts\/\d+\/edit/);

    await page.fill('input[name="first"]', "Original");
    await page.fill('input[name="last"]', "Name");
    await page.click('button:has-text("Save")');

    // Should be on detail page now
    await page.waitForURL(/\/contacts\/\d+$/);
    await page.click('button:has-text("Edit")');

    // Should be back on edit page
    await page.waitForURL(/\/contacts\/\d+\/edit/);
    await page.fill('input[name="first"]', "Jane");
    await page.fill('input[name="last"]', "Smith");

    await page.click('button:has-text("Save")');

    // Should be on detail page with updated info
    await page.waitForURL(/\/contacts\/\d+$/);
    await expect(page.locator("#detail h1")).toContainText("Jane Smith");
  });

  test("should toggle favorite status", async ({ page }) => {
    // Create a contact first
    await page.click('button:has-text("New")');
    await page.waitForURL(/\/contacts\/\d+\/edit/);

    await page.fill('input[name="first"]', "Favorite");
    await page.fill('input[name="last"]', "Test");
    await page.click('button:has-text("Save")');

    // Should be on detail page
    await page.waitForURL(/\/contacts\/\d+$/);

    const favoriteButton = page.locator('button[name="favorite"]');
    const initialText = await favoriteButton.textContent();

    await favoriteButton.click();

    await page.waitForLoadState("networkidle");
    const newText = await favoriteButton.textContent();
    expect(newText).not.toBe(initialText);
  });

  test("should delete a contact", async ({ page }) => {
    // Create a contact first
    await page.click('button:has-text("New")');
    await page.waitForURL(/\/contacts\/\d+\/edit/);

    await page.fill('input[name="first"]', "ToDelete");
    await page.fill('input[name="last"]', "Contact");
    await page.click('button:has-text("Save")');

    // Should be on detail page
    await page.waitForURL(/\/contacts\/\d+$/);

    page.on("dialog", (dialog) => dialog.accept());

    await page.click('button:has-text("Delete")');

    await expect(page).toHaveURL("/");
  });
});

