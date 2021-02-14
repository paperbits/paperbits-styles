import * as Objects from "@paperbits/common/objects";
import * as Utils from "@paperbits/common/utils";
import { BreakpointValues } from "@paperbits/common/styles/breakpoints";
import { LocalStyles } from "@paperbits/common/styles/localStyles";
import { PluginBag } from "@paperbits/common/styles/pluginBagContract";
import { StylePluginConfig } from "@paperbits/common/styles/stylePluginConfig";
import { WidgetModel } from "@paperbits/common/widgets";


export class StyleHelper {
    private static isResponsive(variation: Object): boolean {
        if (!variation) {
            throw new Error(`Parameter "variation" not specified.`);
        }

        return Object.keys(variation).some(props => Object.keys(BreakpointValues).includes(props));
    }

    public static getPluginConfigForLocalStyles(localStyles: LocalStyles, pluginName: string, viewport: string = "xs"): StylePluginConfig {
        if (!localStyles) {
            throw new Error(`Parameter "localStyles" not specified.`);
        }

        if (!pluginName) {
            throw new Error(`Parameter "pluginName" not specified.`);
        }

        if (!localStyles.instance) {
            return null;
        }

        const pluginConfig = localStyles.instance[pluginName];

        if (!pluginConfig) {
            return null;
        }

        const isResponsive = this.isResponsive(pluginConfig);

        if (isResponsive) {
            /* 
                If viewport not specified for requested viewport take closest lower viewport.
                We can uncomment this when we'll be able to collapse breakpoints for child properties with same values.
                For example: { size: { md: { width: 100 }, xs: { width: 100 } } } - collapses into { size: { xs: { width: 100 } } }

                const breakpoint = Utils.getClosestBreakpoint(pluginConfig, viewport);
            */

            const breakpoint = viewport;

            return <StylePluginConfig>pluginConfig[breakpoint];
        }
        else {
            return <StylePluginConfig>pluginConfig;
        }
    }

    /**
     * Updates local styles configuration depending on specified viewport. If viewport not specified, the style gets applied to all viewports.
     * @param localStyles Local styles object.
     * @param pluginName Name of the style plugin, e.g. "background".
     * @param pluginConfig Style plugin configuration object.
     * @param viewport Requested viewport. If viewport not specified, the style gets applied to all viewports.
     */
    public static setPluginConfigForLocalStyles(localStyles: LocalStyles, pluginName: string, pluginConfig: StylePluginConfig, viewport?: string): void {
        if (!localStyles) {
            throw new Error(`Parameter "localStyles" not specified.`);
        }

        if (!pluginName) {
            throw new Error(`Parameter "pluginName" not specified.`);
        }

        const instance = localStyles.instance || {};
        let plugin = instance[pluginName] || {};

        if (viewport) {
            plugin[viewport] = pluginConfig;
        }
        else {
            plugin = pluginConfig;
        }

        instance[pluginName] = plugin;
        localStyles.instance = instance;

        if (!instance.key) {
            instance.key = Utils.randomClassName();
        }

        Objects.cleanupObject(localStyles, true, true);
    }

    public static getPluginConfig(pluginBag: PluginBag, pluginName: string, viewport: string = "xs"): StylePluginConfig {
        if (!pluginBag) {
            throw new Error(`Parameter "pluginBag" not specified.`);
        }

        if (!pluginName) {
            throw new Error(`Parameter "pluginName" not specified.`);
        }

        const pluginConfig = pluginBag[pluginName];

        if (!pluginConfig) {
            return null;
        }

        const isResponsive = this.isResponsive(pluginConfig);

        if (isResponsive) {
            /* 
                If viewport not specified for requested viewport take closest lower viewport.
                We can uncomment this when we'll be able to collapse breakpoints for child properties with same values.
                For example: { size: { md: { width: 100 }, xs: { width: 100 } } }

                const breakpoint = Utils.getClosestBreakpoint(pluginConfig, viewport);
            */

            const breakpoint = viewport;

            return <StylePluginConfig>pluginConfig[breakpoint];
        }
        else {
            return <StylePluginConfig>pluginConfig;
        }
    }

    /**
     * Updates local styles configuration depending on specified viewport. If viewport not specified, the style gets applied to all viewports.
     * @param pluginBag Local styles object.
     * @param pluginName Name of the style plugin, e.g. "background".
     * @param pluginConfig Style plugin configuration object.
     * @param viewport Requested viewport. If viewport not specified, the style gets applied to all viewports.
     */
    public static setPluginConfig(pluginBag: PluginBag, pluginName: string, pluginConfig: StylePluginConfig, viewport?: string): void {
        if (!pluginBag) {
            throw new Error(`Parameter "pluginBag" not specified.`);
        }

        if (!pluginName) {
            throw new Error(`Parameter "pluginName" not specified.`);
        }

        let plugin = pluginBag[pluginName] || {};

        if (viewport) {
            plugin[viewport] = pluginConfig;
        }
        else {
            plugin = pluginConfig;
        }

        pluginBag[pluginName] = plugin;

        if (!pluginBag.key) {
            pluginBag.key = Utils.randomClassName();
        }

        Objects.cleanupObject(pluginBag, true, true);
        // this.optimizePluginConfig(pluginBag);
    }

    public static optimizeProperty(pluginBag: PluginBag, property: string): void {
        if (!StyleHelper.isResponsive(pluginBag[property])) {
            return;
        }

        const result = Utils.optimizeBreakpoints(pluginBag[property]);
        pluginBag[property] = result;
    }

    public static optimizePluginConfig(pluginConfig: StylePluginConfig): void {
        if (!StyleHelper.isResponsive(pluginConfig)) {
            return;
        }

        const breakpoints = ["xs", "sm", "md", "lg", "xl"];
        const lastValues = {};

        for (const breakpoint of breakpoints) {
            const pluginBag = pluginConfig[breakpoint];

            if (!pluginBag) {
                continue;
            }

            const properties = Object.keys(pluginBag);

            for (const property of properties) {
                if (lastValues[property] === pluginBag[property]) {
                    delete pluginBag[property];
                }
                else {
                    lastValues[property] = pluginBag[property];
                }
            }

            if (Object.keys(pluginBag).length === 0) {
                delete pluginConfig[breakpoint];
            }
        }
    }

    /**
     * @deprecated
     */
    public static setPaddings(gridModel: WidgetModel): void {
        gridModel.widgets.forEach(x => {
            x.styles.instance["padding"] = {
                xs: {
                    top: 5,
                    left: 5,
                    right: 5,
                    bottom: 5
                },
                md: {
                    top: 15,
                    left: 15,
                    right: 15,
                    bottom: 15
                }
            };
        });
    }

    /**
     * @deprecated
     */
    public static setMargins(gridModel: WidgetModel): void {
        const styles = gridModel.styles.instance;

        styles["margin"] = {
            xs: {
                top: 10,
                left: "auto",
                right: "auto",
                bottom: 10
            },
            md: {
                top: 15,
                bottom: 15
            },
            xl: {
                top: 25,
                bottom: 25
            }
        };
    }

    /**
     * @deprecated
     */
    public static setMaxWidth(gridModel: WidgetModel): void {
        const styles = gridModel.styles.instance;

        styles["size"] = {
            sm: {
                maxWidth: 540
            },
            md: {
                maxWidth: 720
            },
            lg: {
                maxWidth: 960
            },
            xl: {
                maxWidth: 1140
            }
        };
    }
}