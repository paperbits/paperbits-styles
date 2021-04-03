import { Style, StylePluginConfig, StyleRule } from "@paperbits/common/styles";
import { ThemeContract } from "../contracts/themeContract";

export abstract class StylePlugin {
    protected name: string;

    public async configToStyleRules?(pluginConfig: StylePluginConfig): Promise<StyleRule[]> {
        return [];
    }

    public async configToNestedStyles?(pluginConfig: StylePluginConfig): Promise<Style[]> {
        return [];
    }

    public async configToPseudoStyles?(pluginConfig: StylePluginConfig): Promise<Style[]> {
        return [];
    }

    public setThemeContract?(themeContract: ThemeContract): void;
}