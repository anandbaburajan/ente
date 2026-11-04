import apps from "./apps.json" with { type: "json" };

export type AppName = keyof typeof apps;

const appNames = Object.keys(apps) as AppName[];

const urls = process.env.ENTE_E2E_URLS;
if (!urls)
    throw new Error(
        "Run npm run test:e2e from web to start the Rust test backend.",
    );

export const appURLs = JSON.parse(urls) as Record<AppName, string>;

export const selectedApps = process.env.ENTE_E2E_APPS
    ? process.env.ENTE_E2E_APPS.split(",").map((name) => {
          if (!appNames.includes(name as AppName))
              throw new Error(`Unknown E2E app: ${name}`);
          return name as AppName;
      })
    : appNames;

const requiredApps = new Set<AppName>();
const requireApp = (name: AppName) => {
    for (const dependency of apps[name].dependencies)
        requireApp(dependency as AppName);
    requiredApps.add(name);
};
selectedApps.forEach(requireApp);

export const servedApps = [...requiredApps];
