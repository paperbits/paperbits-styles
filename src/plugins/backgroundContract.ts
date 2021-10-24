import { StylePluginConfig } from "@paperbits/common/styles";

export interface BackgroundImage {
    /**
     * Image source key, e.g. `uploads/image1`.
     */
    sourceKey?: string;

    /**
     * Images size, e.g. `contain`, `cover`.
     */
    size?: string;

   /**
    * Image position, e.g. `top left`.
    */
    position?: string;

    /**
     * Image repeat behavior, e.g. `no-repeat`.
     */
    repeat?: string;

    /**
     * Image attachment behavior, e.g. `fixed`.
     */
    attachment?: string;

    /**
     * Image blend behavior, e.g. `overlay`.
     */
    blend?: string;
}

export interface BackgroundStylePluginConfig extends StylePluginConfig {
    /**
     * Color key, e.g. `colors/default`.
     */
    colorKey?: string;

    /**
     * Gradient key, e.g. `gradients/gradient1`.
     */
    gradientKey?: string;

    /**
     * Images.
     */
    images?: BackgroundImage[];
}
