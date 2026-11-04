# Ente's web apps

Source code for Ente's web apps and supporting websites.

Live versions include:

- Ente Photos: [photos.ente.com](https://photos.ente.com)
- Ente Albums: [albums.ente.com](https://albums.ente.com)
- Ente Auth: [auth.ente.com](https://auth.ente.com)
- Ente Locker: [locker.ente.com](https://locker.ente.com)

To know more about Ente, see [our main README](../README.md) or visit [ente.com](https://ente.com).

## Building from source

Install [Node](https://nodejs.org) and [Rust](https://www.rust-lang.org/tools/install).

Install dependencies

```sh
npm ci
```

Start a local development server

```sh
npm run dev
```

That's it. The web app will automatically hot reload when you make changes.

By default, `npm run dev` builds the Photos app. To run the public albums app, use `npm run dev:albums`. To run auth, use `npm run dev:auth`.

To see the full list of apps you can run (and other scripts that you can use), use `npm run`.

> [!NOTE]
>
> If `package-lock.json` has not changed since your last `npm ci`, you can use `npm install` as a faster incremental alternative.

## End-to-end tests

The Playwright suite tests Photos, Albums, and Photobooks against production
builds and a disposable Museum, PostgreSQL, and object store managed by
`rust/crates/test-support`. It requires Go on PATH in addition to Node and Rust.
PostgreSQL is downloaded and cached on first use; Docker and an email service
are not needed.

From `web`, install dependencies and Chromium once:

```sh
npm ci
npm exec --workspace ente-web-e2e -- playwright install chromium
```

Run the suite:

```sh
npm run test:e2e
```

Playwright arguments can be passed through, for example
`npm run test:e2e -- --headed`. To build and test one app and its dependencies:

```sh
ENTE_E2E_APPS=albums npm run test:e2e
```

`ENTE_E2E_APPS` accepts a comma-separated list of names from `e2e/apps.json`.
The launcher chooses local ports and configures Museum's cross-app links. Each
test gets a fresh browser context and, when requested, a unique account with
real encryption keys and SRP credentials. Tests share the disposable backend,
not accounts or browser storage. The backend and app servers stop after the
run, and all test data is discarded on success.

The builds use a temporary Museum endpoint, so run the usual build again before
using that output for another environment. Browser requests to external hosts
are blocked; Ente API calls and object transfers use the local backend.

PR CI runs the suite for changes under `web`, Museum, and the Rust dependencies
used by these tests. The result is included in `CI required`; failures upload
diagnostics as the `web-e2e-failure` artifact. CI runs one worker; local runs use
two. Test independence can be checked with
`npm run test:e2e -- --repeat-each=2 --workers=3`.

The initial flows are:

- Photos: upload a generated PNG, sign in from a fresh browser context, and
  verify that the downloaded original matches byte for byte.
- Albums: share an uploaded photo, download it as a guest, revoke the link, and
  verify that a new guest can no longer access it.
- Photobooks: import an encrypted album, edit the book title, reload to verify
  autosave, and check the minimum-page requirement for printing.

Crypto, API requests, and object transfers use the real application code.
Photobooks advances Playwright's clock to exercise the autosave debounce.

Failures retain traces and screenshots under `e2e/test-results`, alongside a
copy of the Museum log. Videos are disabled. Open the HTML report with
`npm exec --workspace ente-web-e2e -- playwright show-report`.

### Adding tests

Add cases to `e2e/<app>.spec.ts` and import `test` and `expect` from
`e2e/fixtures.ts`. The `account` fixture creates an account for that test;
`apps` provides local app URLs; `newContext` creates an isolated visitor or
fresh login session and closes it during teardown. For a populated public
album, import from `e2e/album-fixtures.ts` and request `sharedAlbum`. Its owner
uploads and shares through the Photos UI independently for each test.

To cover another app, add its name and server dependencies to `e2e/apps.json`,
use the existing `build:<app>` script, and add `e2e/<app>.spec.ts`. Set
`museum_key` when Museum needs its origin for generated links. Extend the
`web-e2e` Rust path filters in `.github/scripts/ci/paths.json` for any additional
bindings or crates it uses.

Use accessible locators and assertions that wait for observable results. Keep
tests independent, and avoid fixed sleeps, production services, and mocking
the Ente behavior being tested. These conventions follow Playwright's
[best practices](https://playwright.dev/docs/best-practices) and
[fixture guidance](https://playwright.dev/docs/test-fixtures).

## Docker images

A Docker image containing the self-hosting web apps is available from `ghcr.io/ente/web`. See [docs/docker.md](docs/docker.md) for more details.

## Attributions

City coordinates from [Simple Maps](https://simplemaps.com/data/world-cities)

## 🌍 Translate

[![Crowdin](https://badges.crowdin.net/ente-photos-web/localized.svg)](https://crowdin.com/project/ente-photos-web)

The web apps can be translated in the [Ente Web Crowdin project](https://crowdin.com/project/ente-photos-web). See [docs/translations.md](docs/translations.md) for more details.

## 💚 Contribute

For more ways to contribute, see [CONTRIBUTING.md](../CONTRIBUTING.md).
