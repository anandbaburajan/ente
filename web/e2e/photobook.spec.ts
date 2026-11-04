import { expect, test } from "./album-fixtures";

test("an imported album becomes a photobook that survives reload", async ({
    page,
    sharedAlbum,
}) => {
    await page.clock.install();
    await page.goto("/");
    await page
        .getByRole("textbox", { name: "Ente album link", exact: true })
        .fill(sharedAlbum.url);
    await page.getByRole("button", { name: "Import", exact: true }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(
        page.getByRole("main", { name: "Photobook editor", exact: true }),
    ).toBeVisible();
    const title = page.getByRole("textbox", {
        name: "Photobook title",
        exact: true,
    });
    await title.fill("Our E2E photobook");
    await title.press("Tab");
    await page.clock.runFor(1000);
    await page.reload();
    await expect(title).toHaveValue("Our E2E photobook");
    await expect(
        page.getByRole("main", { name: "Photobook editor", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Preview", exact: true }).click();
    await expect(
        page.getByRole("dialog", { name: /Add \d+ more pages/ }),
    ).toBeVisible();
    await expect(
        page.getByText(
            "Printed books need at least 24 pages, including the covers.",
            { exact: true },
        ),
    ).toBeVisible();
});
