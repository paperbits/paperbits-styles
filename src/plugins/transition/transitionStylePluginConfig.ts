
export interface TransitionStylePluginConfig {
    /**
     * 	Specifies a delay (in seconds) for the transition effect.
     */
    delay: number;

    /**
     * 	Specifies how many seconds or milliseconds a transition effect takes to complete.
     */
    duration: number;

    /**
     * 	Specifies the name of the CSS property the transition effect is for.
     */
    property: string;

    /**
     * Specifies the speed curve of the transition effect, e.g. "ease", "linear", "ease-in", "ease-out", "ease-in-out".
     */
    timingFunction: string;
}
