import { StylePluginConfig } from "@paperbits/common/styles";

export interface PositionStylePluginConfig extends StylePluginConfig {
    /**
     * e.g. `relative`, `absolute` or `fixed`.
     */
    position?: string;

    /**
     * e.g. `50%`.
     */
    top?: number | string;

    /**
     * e.g. `50%`.
     */
    left?: number | string;

    /**
     * e.g. `50%`.
     */
    right?: number | string;

    /**
     * e.g. `50%`.
     */
    bottom?: number | string;

    /**
     * z-index
     */
    zIndex?: number;
}