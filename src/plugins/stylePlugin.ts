import { Style, StyleRule } from "@paperbits/common/styles";

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

    public static parseSize = (value: string | number): any => {
        if (value === "auto" || value === "initial") {
            return value;
        }

        if (value) {
            return parseInt(<string>value) + "px";
        }
        else {
            return undefined;
        }
    };
}