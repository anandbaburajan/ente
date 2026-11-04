import { expect, test } from "./fixtures";
import {
    expectOriginalDownload,
    login,
    photoName,
    uploadAlbum,
} from "./photos";

test("uploaded original survives a fresh login", async ({
    page,
    context,
    account,
    newContext,
}, testInfo) => {
    const albumName = "E2E upload round trip";
    await login(page, account);
    await uploadAlbum(page, albumName);
    await context.close();

    const freshContext = await newContext();
    const freshPage = await freshContext.newPage();
    await login(freshPage, account);
    await freshPage
        .getByRole("button", { name: "Albums", exact: true })
        .click();
    await freshPage
        .getByRole("navigation", { name: "Albums", exact: true })
        .getByRole("button", { name: albumName, exact: true })
        .click();
    const thumbnail = freshPage.getByRole("img", {
        name: photoName,
        exact: true,
    });
    await expect(thumbnail).toBeVisible();
    await expect
        .poll(() =>
            thumbnail.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBeGreaterThan(0);
    await thumbnail.locator("..").click();
    const original = freshPage.locator(
        ".pswp__img:not(.pswp__img--placeholder)",
    );
    await expect(original).toBeVisible();
    await expect
        .poll(() =>
            original.evaluate((image: HTMLImageElement) => image.naturalWidth),
        )
        .toBe(640);
    await freshPage.getByRole("button", { name: "More", exact: true }).click();
    await expectOriginalDownload(
        freshPage,
        testInfo.outputPath(photoName),
        "menuitem",
    );
});
