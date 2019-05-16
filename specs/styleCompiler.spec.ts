import { assert, expect } from "chai";
import { GridStylePlugin } from "../src/plugins/gridStylePlugin";
import { GridContract } from "../src/contracts/gridContract";
import preset from "jss-preset-default";


describe("Style compiler", async () => {
    it("Test1", async () => {
        const gridStylePlugin = new GridStylePlugin();

        const gridContract: GridContract = {
            rows: [
                "1fr",
                "5fr",
                "1fr"
            ],
            rowGap: "0",
            cols: [
                "1fr",
                "5fr",
                "1fr"
            ],
            colGap: "0"
        };

        const jss = await gridStylePlugin.contractToJss(gridContract);
        const css = gridStylePlugin.jssToCss(jss);

        console.log(css);
    });
});