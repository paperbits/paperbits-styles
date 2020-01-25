import { Bag } from "@paperbits/common";
import { ColorContract, ShadowContract, AnimationContract, FontContract, LinearGradientContract } from "./";
import { ComponentsContract } from "@paperbits/common/styles";


/**
 * Theme contract.
 */
export interface ThemeContract {
    /**
     * Font definitions.
     */
    fonts?: Bag<FontContract>;

    /**
     * Color definitions.
     */
    colors?: Bag<ColorContract>;

    /**
     * Gradient definitions.
     */
    gradients?: Bag<LinearGradientContract>;

    /**
     * Animation definitions.
     */
    animations?: Bag<AnimationContract>;

    /**
     * Shadow definitions.
     */
    shadows?: Bag<ShadowContract>;

    /**
     * Global component definitions.
     */
    globals?: ComponentsContract;

    /**
     * Component definitions.
     */
    components?: ComponentsContract;

    /**
     * Utility styles.
     */
    utils?: any;
}