import { ContentAlignment } from "./contentAlignment";
import { ContentOverflow } from "./contentOverflow";


export interface ContainerStylePluginConfig {
    alignment?: ContentAlignment;
    overflow?: ContentOverflow;
}