import { expect } from "chai";
import { StyleHelper } from "./../src/styleHelper";
import { LocalStyles, PluginBag, Breakpoints } from "@paperbits/common/styles";
import { TypographyStylePluginConfig } from "../src/contracts";
import { StyleEditor } from "../src/workshops/styleEditor";


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

    it("Sets local styles properly", async () => {
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

        StyleHelper.setPluginConfigForLocalStyles(localStyles, "size", sizeConfigNew, "md"); // applying to specific viewport
        expect(localStyles.instance.size.md).to.equal(sizeConfigNew);
        expect(localStyles.instance.size.xs).to.equal(sizeConfigXs);
        expect(localStyles.instance.background.xs).to.equal(backgroundConfigXs);
        expect(localStyles.appearance).to.equal(appearanceVariationKey);

        StyleHelper.setPluginConfigForLocalStyles(localStyles, "size", sizeConfigNew); // applying to all viewports
        expect(localStyles.instance.size).to.equal(sizeConfigNew);
        expect(localStyles.instance.size.md).to.equal(undefined);
        expect(localStyles.instance.size.xs).to.equal(undefined);
        expect(localStyles.instance.background.xs).to.equal(backgroundConfigXs);
        expect(localStyles.appearance).to.equal(appearanceVariationKey);
    });

    it("Test1", async () => {
        const fontSizeXs = 15;
        const fontSizeMd = 15;
        const fontSizeLg = 20;
        const fontWeight = 400;

        const pluginBag: PluginBag = {
            fontSize: {
                xs: fontSizeXs,
                md: fontSizeMd
            },
            fontWeight: 400
        };

        const typographyConfig: TypographyStylePluginConfig = {
            fontSize: fontSizeMd,
        };

        StyleHelper.setPluginConfig(pluginBag, "size", typographyConfig, "lg"); // applying to specific viewport

        // expect(pluginBag.fontSize.xs).to.equal(fontSizeXs);
        // expect(pluginBag.fontSize.md).to.equal(fontSizeMd);
        // expect(pluginBag.fontWeight).to.equal(400);

        StyleHelper.optimizeProperty(pluginBag, "fontSize");

        debugger;
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
});