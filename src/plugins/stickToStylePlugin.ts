import { StylePlugin } from "./stylePlugin";
import { StyleRule } from "@paperbits/common/styles";


export class StickToStylePlugin extends StylePlugin {
    public displayName: string = "Stick to";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: string): Promise<StyleRule[]> {
        if (!pluginConfig || pluginConfig === "none") {
            return [];
        }

        const rules = [];

        rules.push(new StyleRule("position", "sticky"));
        rules.push(new StyleRule("zIndex", "1020"));

        switch (pluginConfig) {
            case "top":
                rules.push(new StyleRule("top", "0"));
                break;

            case "bottom":
                rules.push(new StyleRule("bottom", "0"));
                break;

            default:
                throw new Error(`Unknown option value for "stickTo" plugin: ${pluginConfig}`);
        }

        return rules;
    }
}