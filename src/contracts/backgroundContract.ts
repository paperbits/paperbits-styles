export interface BackgroundImage {
    sourceKey?: string;

    /**
     * e.g. "contain", "cover".
     */
    size?: string;

   /**
    * e.g. "top left".
    */
    position?: string;

    /**
     * e.g. "no-repeat"
     */
    repeat?: string;
}

export interface BackgroundStylePluginConfig {
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
