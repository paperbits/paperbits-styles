import { StylePluginConfig } from "@paperbits/common/styles";

export interface BackgroundImage {
    /**
     * Image source key, e.g. `uploads/image1`.
     */
    sourceKey?: string;

    /**
     * e.g. `contain`, `cover`.
     */
    size?: string;

   /**
    * e.g. "top left".
    */
    position?: string;

    /**
     * e.g. "no-repeat".
     */
    repeat?: string;

    /**
     * e.g. "fixed".
     */
    attachment?: string;

    /**
     * e.g. "overlay"
     */
    blend?: string;
}

export interface BackgroundStylePluginConfig extends StylePluginConfig {
    /**
     * e.g. "colors/default"
     */
    colorKey?: string;

    /**
     * e.g. "gradients/gradient1"
     */
    gradientKey?: string;

    images?: BackgroundImage[];
}
