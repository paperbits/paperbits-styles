import { Bag } from "@paperbits/common";
import { ColorContract, ShadowContract, AnimationContract, FontContract, LinearGradientContract } from "./";
import { ComponentBagContract } from "@paperbits/common/styles";
import { FontGlyphContract } from "./fontGlyphContract";


/**
 * Theme contract.
 */
export interface ThemeContract {
    /**
     * Contract schema version.
     */
    schemaVersion?: number;

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
     * Icon set definition.
     */
    icons?: Bag<FontGlyphContract>;

    /**
     * Global component definitions.
     */
    globals?: ComponentBagContract;

    /**
     * Component definitions.
     */
    components?: ComponentBagContract;

    /**
     * Utility styles.
     */
    utils?: any;
}