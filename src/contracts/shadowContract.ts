export interface ShadowContract {
    /**
     * Own key.
     */
    key: string;

    /**
     * Display name of the shadow that is shown in editors.
     */
    displayName: string;

    /**
     * Shadow offset X.
     */
    offsetX: string | number;

    /**
     * Shadow offset Y.
     */
    offsetY: string | number;

    /**
     * Shadow spread radius.
     */
    spread: string | number;

    /**
     * Shadow blur radius.
     */
    blur: string | number;

    /**
     * Shadow color.
     */
    color: string | number;

    /**
     * Display the shadow inset.
     */
    inset?: boolean;
}

export interface ShadowStylePluginConfig {
    shadowKey: string;
}