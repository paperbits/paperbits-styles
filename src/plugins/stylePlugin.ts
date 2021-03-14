import { Style, StyleRule } from "@paperbits/common/styles";
import { ThemeContract } from "../contracts/themeContract";

export abstract class StylePlugin {
    protected name: string;

    public async configToStyleRules?(pluginConfig: any): Promise<StyleRule[]> {
        return [];
    }

    public async configToNestedStyles?(pluginConfig: any): Promise<Style[]> {
        return [];
    }

    public async configToPseudoStyles?(pluginConfig: any): Promise<Style[]> {
        return [];
    }

    private static isNumber(value: string): boolean {
        return /^\d*$/gm.test(value);
    }

    public static parseSize = (value: string | number, fallback: string | number = 0): string => {
        if (value === "auto" || value === "initial" || value === "inherit") {
            return value;
        }

        if (value === null || value === undefined) {
            return `${fallback}px`;
        }

        if (typeof value === "number" || StylePlugin.isNumber(value)) {
            return value + "px";
        }

        if (typeof value === "string") {
            return value;
        }

        throw new Error(`Unparsable value ${value}`);
    };

    public setThemeContract?(themeContract: ThemeContract): void;
}