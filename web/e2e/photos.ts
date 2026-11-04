import type { Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, type Account } from "./fixtures";

export const photoName = "IMG_20240304_050607.png";
const photoPath = resolve(import.meta.dirname, "fixtures", photoName);

export const login = async (page: Page, account: Account) => {
    await page.goto("/login");
    await page.getByLabel("Email address", { exact: true }).fill(account.email);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.getByLabel("Password", { exact: true }).fill(account.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/gallery/);
};

export const uploadAlbum = async (page: Page, name: string) => {
    await page.getByRole("button", { name: "Albums", exact: true }).click();
    await page
        .getByRole("navigation", { name: "Albums", exact: true })
        .getByRole("button", { name: "New album", exact: true })
        .click();
    const dialog = page.getByRole("dialog", { name: "New album", exact: true });
    await dialog.getByLabel("Album name", { exact: true }).fill(name);
    await dialog.getByRole("button", { name: "Create", exact: true }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "Add photos", exact: true }).click();
    const [picker] = await Promise.all([
        page.waitForEvent("filechooser"),
        page.getByRole("button", { name: "Files", exact: true }).click(),
    ]);
    await picker.setFiles(photoPath);
    await expect(
        page.getByText("Upload complete", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(
        page.getByText("Upload complete", { exact: true }),
    ).toBeHidden();
    await expect(
        page.getByRole("img", { name: photoName, exact: true }),
    ).toBeVisible();
};

export const shareAlbum = async (page: Page) => {
    await page
        .getByRole("button", { name: "Share album", exact: true })
        .click();
    await page
        .getByRole("button", { name: "Create public link", exact: true })
        .click();
    const link = page.getByTitle(/^http:\/\/127\.0\.0\.1:/);
    await expect(link).toBeVisible();
    return (await link.getAttribute("title"))!;
};

export const expectOriginalDownload = async (
    page: Page,
    path: string,
    role: "button" | "menuitem",
) => {
    const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole(role, { name: "Download", exact: true }).click(),
    ]);
    expect(download.suggestedFilename()).toBe(photoName);
    await download.saveAs(path);
    expect(await readFile(path)).toEqual(await readFile(photoPath));
};
