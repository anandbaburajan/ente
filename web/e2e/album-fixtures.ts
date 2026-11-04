import type { Page } from "@playwright/test";
import { test as base } from "./fixtures";
import { login, shareAlbum, uploadAlbum } from "./photos";

export { expect } from "./fixtures";

interface SharedAlbum {
    name: string;
    url: string;
    ownerPage: Page;
}

export const test = base.extend<{ sharedAlbum: SharedAlbum }>({
    sharedAlbum: async ({ account, apps, newContext }, use) => {
        const context = await newContext({ baseURL: apps.photos });
        const ownerPage = await context.newPage();
        const name = "E2E shared album";
        await login(ownerPage, account);
        await uploadAlbum(ownerPage, name);
        const url = await shareAlbum(ownerPage);
        await use({ name, url, ownerPage });
    },
});
