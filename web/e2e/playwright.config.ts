import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";
import { appURLs, selectedApps, servedApps } from "./apps";

export default defineConfig({
    testDir: ".",
    forbidOnly: !!process.env.CI,
    fullyParallel: true,
    workers: process.env.CI ? 1 : 2,
    timeout: 120_000,
    expect: { timeout: 15_000 },
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        ...devices["Desktop Chrome"],
        actionTimeout: 15_000,
        locale: "en-US",
        timezoneId: "UTC",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "off",
    },
    projects: selectedApps.map((name) => ({
        name,
        testMatch: `${name}.spec.ts`,
        use: { baseURL: appURLs[name] },
    })),
    webServer: servedApps.map((name) => ({
        name,
        command: `npm run build:${name} && npm exec --workspace ente-web-e2e -- serve ../apps/${name}/out --listen ${appURLs[name].replace("http:", "tcp:")} --single --no-clipboard --no-request-logging --no-port-switching`,
        cwd: resolve(import.meta.dirname, ".."),
        url: appURLs[name],
        timeout: 600_000,
        reuseExistingServer: false,
        stdout: "pipe",
        stderr: "pipe",
    })),
});
