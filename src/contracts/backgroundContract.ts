import { LinearGradientContract } from "./linearGradientContract";

export interface BackgroundContract {
    colorKey?: string;
    sourceKey?: string;

    /**
     * e.g. "top left".
     */
    position?: string;

    /**
     * e.g. "contain", "cover".
     */
    size?: string;
    repeat?: string;
    gradient?: LinearGradientContract;
}
