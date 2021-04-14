/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { globals } from "../jest.config";

// Tests disabled -- requires Tinylicious to be running, which our test environment doesn't do.
describe("diceRoller", () => {
    beforeAll(async () => {
        // Wait for the page to load first before running any tests
        // so this time isn't attributed to the first test
        await page.goto(globals.PATH, { waitUntil: "load", timeout: 0 });
    }, 45000);

    beforeEach(async () => {
        await page.goto(globals.PATH, { waitUntil: "load" });
        await page.waitFor(() => window["fluidStarted"]);
    });

    it("Inspector at root1 is rendered", async () => {
        expect(await page.$eval('#root1', el => el.children.length)).toEqual(1);
    });

    it("Inspector at root2 is rendered", async () => {
        expect(await page.$eval('#root2', el => el.children.length)).toEqual(1);
    });
});
