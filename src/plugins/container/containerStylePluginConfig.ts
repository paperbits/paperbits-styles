import { StylePluginConfig } from "@paperbits/common/styles";
import { ContentAlignment } from "../../contracts/contentAlignment";
import { ContentOverflow } from "../../contracts/contentOverflow";

export interface ContainerStylePluginConfig extends StylePluginConfig {
    /**
     * Indicates content alignment inside the container.
     */
    alignment?: ContentAlignment;

    /**
     * Defines behavior when content overflowing the container.
     */
    overflow?: ContentOverflow;
}