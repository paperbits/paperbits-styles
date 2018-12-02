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
     * Unique identifier.
     */
    key: string;

    /**
     * Display name.
     */
    displayName: string;

    /**
     * Direction of the gradient, e.g. 45deg.
     */
    direction: string;

    /**
     * Color stops.
     */
    colorStops: LinearGradientColorStopContract[];
}

/**
 * Builds linear gradient string, e.g. "linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%)"
 * @param contract {LinearGradientContract}
 */
export function getLinearGradientString(contract: LinearGradientContract): string {
    const colorStops = contract.colorStops.map(colorStop => {
        let colorStopString = colorStop.color;

        if (colorStop.length) {
            colorStopString += " " + colorStop.length;
        }

        return colorStopString;
    });

    return `linear-gradient(${contract.direction},${colorStops.join(",")})`;
}