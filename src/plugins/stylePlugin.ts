import { Style, StyleRule } from "@paperbits/common/styles";

export abstract class StylePlugin {
    protected name: string;

    public async configToStyleRules?(config: any): Promise<StyleRule[]> {
        return [];
    }

    public async configToNestedStyles?(config: any): Promise<Style[]> {
        return [];
    }

    public async configToPseudoStyles?(config: any): Promise<Style[]> {
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