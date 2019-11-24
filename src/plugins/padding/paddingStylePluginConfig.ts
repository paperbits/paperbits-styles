import { StylePluginConfig } from "@paperbits/common/styles";

export interface PaddingStylePluginConfig extends StylePluginConfig {
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
}