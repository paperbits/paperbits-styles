import { StylePluginConfig } from "@paperbits/common/styles";
import { ContentAlignment } from "./contentAlignment";
import { ContentOverflow } from "./contentOverflow";

export interface ContainerStylePluginConfig extends StylePluginConfig {
    alignment?: ContentAlignment;
    overflow?: ContentOverflow;
}