import { StylePlugin } from "../stylePlugin";
import { StyleRule } from "@paperbits/common/styles";
import { ListStylePluginConfig } from "./listStylePluginConfig";

export class ListStylePlugin extends StylePlugin {
    public readonly name: string = "list";

    constructor() {
        super();
    }

    public async configToStyleRules(pluginConfig: ListStylePluginConfig): Promise<StyleRule[]> {
        const result = [];

        if (pluginConfig.styleType) {
            result.push(new StyleRule("listStyleType", pluginConfig.styleType));
        }

        return result;
    }
}
