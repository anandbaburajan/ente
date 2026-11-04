import { expect, test } from "./album-fixtures";
import { expectOriginalDownload, photoName } from "./photos";

test("a guest can download a shared photo until its link is revoked", async ({
    page,
    sharedAlbum,
    apps,
    newContext,
}, testInfo) => {
    expect(new URL(sharedAlbum.url).origin).toBe(apps.albums);
    await page.goto(sharedAlbum.url);
    await expect(
        page.getByRole("heading", { name: sharedAlbum.name, exact: true }),
    ).toBeVisible();
    const thumbnail = page.getByRole("img", { name: photoName, exact: true });
    await expect(thumbnail).toBeVisible();
    await expect
        .poll(() =>
            thumbnail.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
    await thumbnail.locator("..").click();
    await expect(
        page.locator(".pswp__img:not(.pswp__img--placeholder)"),
    ).toBeVisible();
    await expectOriginalDownload(
        page,
        testInfo.outputPath(photoName),
        "button",
    );
    await sharedAlbum.ownerPage
        .getByRole("button", { name: "Manage link", exact: true })
        .click();
    await sharedAlbum.ownerPage
        .getByRole("button", { name: "Remove link", exact: true })
        .click();
    await expect(
        sharedAlbum.ownerPage.getByRole("button", {
            name: "Create public link",
            exact: true,
        }),
    ).toBeVisible();
    const revokedContext = await newContext();
    const revokedPage = await revokedContext.newPage();
    await revokedPage.goto(sharedAlbum.url);
    await expect(
        revokedPage.getByText(
            "This link has either expired or has been disabled",
            { exact: true },
        ),
    ).toBeVisible();
    await expect(
        revokedPage.getByRole("img", { name: photoName, exact: true }),
    ).toHaveCount(0);
});
