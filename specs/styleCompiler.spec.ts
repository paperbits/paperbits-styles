import { assert, expect } from "chai";
import { GridStylePlugin } from "../src/plugins/gridStylePlugin";
import { GridContract } from "../src/contracts/gridContract";
import preset from "jss-preset-default";
import { StyleSheet, StyleRule, StyleMediaQuery, Style } from "../src/styles";

describe("Style compiler", async () => {
    // it("Test1", async () => {
    //     const gridStylePlugin = new GridStylePlugin();

    //     const gridContract: GridContract = {
    //         rows: [
    //             "1fr",
    //             "5fr",
    //             "1fr"
    //         ],
    //         rowGap: "0",
    //         cols: [
    //             "1fr",
    //             "5fr",
    //             "1fr"
    //         ],
    //         colGap: "0"
    //     };

    //     const jss = await gridStylePlugin.contractToStyleRules(gridContract);
    //     const css = gridStylePlugin.jssToCss(jss);

    //     console.log(css);
    // });

    it("Test2", async () => {
        const borderRule = new StyleRule("border", "10px solid blue");
        const fontSizeRule = new StyleRule("font-size", "20px");

        const buttonLabelStyle = new Style();
        buttonLabelStyle.selector = "label";
        buttonLabelStyle.rules.push(fontSizeRule);

        const styleUnderNestedMediaQuery = new Style();
        styleUnderNestedMediaQuery.selector = "xs";
        styleUnderNestedMediaQuery.rules.push(borderRule);

        const nestedMediaQuery = new StyleMediaQuery(750);
        nestedMediaQuery.styles.push(styleUnderNestedMediaQuery);

        const buttonStyle = new Style();
        buttonStyle.selector = "button";
        buttonStyle.rules.push(borderRule);
        buttonStyle.nestedStyles.push(buttonLabelStyle);
        buttonStyle.nestedMediaQueries.push(nestedMediaQuery);

        const borderRule2 = new StyleRule("border", "5px solid blue");
       

        const styleUnderMediaQuery = new Style();
        styleUnderMediaQuery.selector = "button";
        styleUnderMediaQuery.rules.push(borderRule2);

        const mediaQuery = new StyleMediaQuery(750);
        mediaQuery.styles.push(styleUnderMediaQuery);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(buttonStyle);
        styleSheet.mediaQueries.push(mediaQuery);

        const result = styleSheet.toJssString();

        const json = JSON.parse(result);
        console.log(JSON.stringify(json, null, 4));
    });
});