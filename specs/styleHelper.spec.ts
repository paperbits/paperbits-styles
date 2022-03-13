import { expect } from "chai";
import { StyleHelper } from "./../src/styleHelper";
import { LocalStyles, Breakpoints, StyleDefinition } from "@paperbits/common/styles";
import { TypographyStylePluginConfig } from "../src/plugins";
import { CalcExpression, Size } from "../src/size";


describe("Style helper", async () => {
    it("Can extracts local styles properly depending on requested viewport.", async () => {
        const sizeConfigXs = 100;

        const localStyles: LocalStyles = {
            instance: {
                size: {
                    xs: sizeConfigXs
                }
            }
        };

        const stylePluginConfigXs = StyleHelper.getPluginConfigForLocalStyles(localStyles, "size", "xs");
        expect(stylePluginConfigXs).to.equal(sizeConfigXs);

        // We can uncomment this when we'll be able to collapse breakpoints for child properties with same values.
        // const stylePluginConfigMd = StyleHelper.getPluginConfigForLocalStyles(localStyles, "size", "md");
        // expect(stylePluginConfigMd).to.equal(sizeConfigXs);
    });

    it("Returns null when local styles are empty.", async () => {
        const emptyLocalStyles: LocalStyles = {};
        const stylePluginConfigMd = StyleHelper.getPluginConfigForLocalStyles(emptyLocalStyles, "size", "md");
        expect(stylePluginConfigMd).to.equal(null);
    });

    it("Sets and collapses nulls properly.", () => {
        const sizeConfigXs = 100;
        const backgroundConfigXs = 300;
        const appearanceVariationKey = "components/picture/default";

        const localStyles: LocalStyles = {
            instance: {
                size: {
                    xs: sizeConfigXs
                },
                background: {
                    xs: backgroundConfigXs
                }
            },
            appearance: appearanceVariationKey
        };

        // if there is no non-null "size" props left, the "size" itself must become "null".
        StyleHelper.setPluginConfigForLocalStyles(localStyles, "size", null, "xs");
        expect(localStyles.instance.size === null);
    });

    it("Sets local styles properly", () => {
        const sizeConfigXs = 100;
        const sizeConfigNew = 200;
        const backgroundConfigXs = 300;
        const appearanceVariationKey = "components/picture/default";

        const localStyles: LocalStyles = {
            instance: {
                size: {
                    xs: sizeConfigXs
                },
                background: {
                    xs: backgroundConfigXs
                }
            },
            appearance: appearanceVariationKey
        };

        /* applying config to specific viewport */
        StyleHelper.setPluginConfigForLocalStyles(localStyles, "size", sizeConfigNew, "md");
        expect(localStyles.instance.size.md).to.equal(sizeConfigNew);
        expect(localStyles.instance.size.xs).to.equal(sizeConfigXs);
        expect(localStyles.instance.background.xs).to.equal(backgroundConfigXs);
        expect(localStyles.appearance).to.equal(appearanceVariationKey);

        /* applying config to all viewports */
        StyleHelper.setPluginConfigForLocalStyles(localStyles, "size", sizeConfigNew);
        expect(localStyles.instance.size).to.equal(sizeConfigNew);
        expect(localStyles.instance.size.md).to.equal(undefined);
        expect(localStyles.instance.size.xs).to.equal(undefined);
        expect(localStyles.instance.background.xs).to.equal(backgroundConfigXs);
        expect(localStyles.appearance).to.equal(appearanceVariationKey);
    });

    it("Can optimize style plugin config", async () => {
        const fontSizeXs = 15;
        const fontSizeMd = 17;
        const fontSizeLg = 17;
        const fontWeightXs = 400;
        const fontWeightLg = 600;

        const config: Breakpoints<TypographyStylePluginConfig> = {
            xs: {
                fontWeight: fontWeightXs,
                fontSize: fontSizeXs,
            },
            md: {
                fontSize: fontSizeMd
            },
            lg: {
                fontWeight: fontWeightLg,
                fontSize: fontSizeLg
            }
        };

        StyleHelper.optimizePluginConfig(config);
        console.log(JSON.stringify(config));

        expect(config.xs.fontSize).to.equal(fontSizeXs); // Stays as is
        expect(config.md.fontSize).to.equal(fontSizeMd); // Stays as is
        expect(config.lg.fontSize).to.equal(undefined); // Gets removed
        expect(config.lg.fontWeight).to.equal(600); // Stays as is
    });

    it("Calc expression parses and stringifies correctly", async () => {
        const expression1 = "calc(-50% + 100px)";
        const parsed1 = CalcExpression.parse(expression1);
        expect(parsed1.toString()).equals(expression1);

        const expression2 = "calc(-50% - 100px)";
        const parsed2 = CalcExpression.parse(expression2);
        expect(parsed2.toString()).equals(expression2);

        const expression3 = "calc(50% + 100px)";
        const parsed3 = CalcExpression.parse(expression3);
        expect(parsed3.toString()).equals(expression3);

        const expression4 = "calc(50% - 100px)";
        const parsed4 = CalcExpression.parse(expression4);
        expect(parsed4.toString()).equals(expression4);
    });

    it("Size expression parses and stringifies correctly", async () => {
        const expression1 = "50%";
        const parsed1 = Size.parse(expression1);
        expect(parsed1.toString()).equals(expression1);

        const expression2 = "50px";
        const parsed2 = Size.parse(expression2);
        expect(parsed2.toString()).equals(expression2);

        const expression3 = "50fr";
        const parsed3 = Size.parse(expression3);
        expect(parsed3.toString()).equals(expression3);

        const expression4 = "50in";
        const parsed4 = Size.parse(expression4);
        expect(parsed4.toString()).equals(expression4);

        const expression5 = "50";
        const parsed5 = Size.parse(expression5);
        expect(parsed5.toString()).equals("50px"); // "px" - default units must be assigned

        const expression6 = 50;
        const parsed6 = Size.parse(expression6);
        expect(parsed6.toString()).equals("50px"); // "px" - default units must be assigned
    });

    it("Backfill local styles", () => {
        const styleDefinition: StyleDefinition = {
            colors: {
                labelColor: {
                    displayName: "Label color",
                    defaults: {
                        value: "green"
                    }
                }
            },
            components: {
                clickCounter: {
                    displayName: "Click counter",
                    plugins: ["margin", "padding", "typography"],
                    defaults: {
                        typography: {
                            fontSize: 10,
                        }
                    },
                    components: {
                        label: {
                            displayName: "Click counter label",
                            plugins: ["typography"],
                            defaults: {
                                typography: {
                                    fontSize: 50,
                                    color: "colors/labelColor"
                                }
                            }
                        }
                    }
                }
            }
        };

        const result: LocalStyles = {
            key: "somekey"
        };

        StyleHelper.backfillLocalStyles(styleDefinition, result);

        console.log(JSON.stringify(result, null, 4));
    });
});