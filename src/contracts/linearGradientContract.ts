export interface LinearGradientColorStopContract {
    /**
     * e.g. #fff.
     */
    color: string;

    /**
     * e.g. 25%.
     */
    length: string;
}

export interface LinearGradientContract {
    /**
     * Direction of the gradient, e.g. 45deg.
     */
    direction: string;

    /**
     * Color stops.
     */
    colorStops: LinearGradientColorStopContract[];
}