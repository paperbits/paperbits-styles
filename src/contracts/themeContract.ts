import { Bag } from "@paperbits/common";
import { ColorContract, ShadowContract, AnimationContract, FontContract, LinearGradientContract } from "./";

export interface ThemeContract {
    fonts?: Bag<FontContract>;
    colors?: Bag<ColorContract>;
    gradients?: Bag<LinearGradientContract>;
    animations?: Bag<AnimationContract>;
    shadows?: Bag<ShadowContract>;
    globals?: Object;
    components?: Object;
    instances?: Object;
    utils?: any;
}