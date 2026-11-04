import {
    test as base,
    type BrowserContext,
    type BrowserContextOptions,
} from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { appURLs, type AppName } from "./apps";

export { expect } from "@playwright/test";

export interface Account {
    email: string;
    password: string;
}

interface Fixtures {
    account: Account;
    apps: Record<AppName, string>;
    newContext: (options?: BrowserContextOptions) => Promise<BrowserContext>;
}

const allowLocalRequests = async (context: BrowserContext) => {
    await context.route(/^https?:/, async (route) => {
        const { hostname } = new URL(route.request().url());
        if (hostname === "127.0.0.1" || hostname === "localhost")
            await route.continue();
        else await route.abort("blockedbyclient");
    });
};

export const test = base.extend<Fixtures>({
    account: async ({}, use) => {
        const { stdout } = await promisify(execFile)(
            process.env.ENTE_E2E_FIXTURE_BIN!,
            ["create-account"],
        );
        await use(JSON.parse(stdout) as Account);
    },
    apps: async ({}, use) => {
        await use(appURLs);
    },
    context: async ({ context }, use) => {
        await allowLocalRequests(context);
        await use(context);
    },
    newContext: async ({ browser, baseURL }, use) => {
        const contexts: BrowserContext[] = [];
        await use(async (options) => {
            const context = await browser.newContext({
                baseURL: baseURL!,
                locale: "en-US",
                timezoneId: "UTC",
                ...options,
            });
            contexts.push(context);
            await allowLocalRequests(context);
            return context;
        });
        for (const context of contexts) await context.close();
    },
});
