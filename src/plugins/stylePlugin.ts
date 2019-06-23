import jss from "jss";
import { Style, StyleRule } from "@paperbits/common/styles";

export abstract class StylePlugin {
    protected name: string;

    public async contractToStyleRules?(contract: any): Promise<StyleRule[]> {
        return [];
    }

    public async contractToNestedStyles?(contract: any): Promise<Style[]> {
        return [];
    }

    public async contractToPseudoStyles?(contract: any): Promise<Style[]> {
        return [];
    }

    public jssToCss?(jssObject: any): string {
        const styleSheet = jss.createStyleSheet(jssObject);
        return styleSheet.toString();
    }

    protected parseSize = (value: string | number): any => {
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