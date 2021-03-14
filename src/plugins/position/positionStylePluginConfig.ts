import { StylePluginConfig } from "@paperbits/common/styles";

export interface PositionStylePluginConfig extends StylePluginConfig {
    /**
     * e.g. `relative`, `absolute` or `fixed`.
     */
    position?: string;

    /**
     * e.g. `50%`.
     */
    top?: string;

    /**
     * e.g. `50%`.
     */
    left?: string;

    /**
     * e.g. `50%`.
     */
    right?: string;

    /**
     * e.g. `50%`.
     */
    bottom?: string;

    /**
     * z-index
     */
    zIndex?: number;
}