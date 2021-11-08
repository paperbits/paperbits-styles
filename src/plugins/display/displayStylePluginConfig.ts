import { StylePluginConfig } from "@paperbits/common/styles";


export enum Display {
    Inline = "inline-block",
    Block = "block",
    None = "none"
}

export interface DisplayPluginConfig extends StylePluginConfig {
    display?: Display;
}
