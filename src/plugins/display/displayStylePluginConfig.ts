import { StylePluginConfig } from "@paperbits/common/styles";


export enum Display {
    Inline = "inline",
    Block = "block",
    None = "none"
}

export interface DisplayPluginConfig extends StylePluginConfig {
    display?: Display;
}
