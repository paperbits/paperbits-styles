import { Bag } from "@paperbits/common";
import { BoxContract, ColorContract, ShadowContract, AnimationContract, FontContract, LinearGradientContract } from "./";

export interface ThemeContract {
    fonts?: Bag<FontContract>;
    colors?: Bag<ColorContract>;
    gradients?: Bag<LinearGradientContract>;
    animations?: Bag<AnimationContract>;
    shadows?: Bag<ShadowContract>;
    globals?: Bag<BoxContract>;
    components?: Object;
    instances?: Object;
}