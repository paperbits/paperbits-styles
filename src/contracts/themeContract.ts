import { Bag } from "@paperbits/common";
import { ColorContract, ShadowContract, AnimationContract, FontContract, LinearGradientContract } from "./";
import { ComponentsContract } from "@paperbits/common/styles";

export interface ThemeContract {
    fonts?: Bag<FontContract>;
    colors?: Bag<ColorContract>;
    gradients?: Bag<LinearGradientContract>;
    animations?: Bag<AnimationContract>;
    shadows?: Bag<ShadowContract>;
    globals?: Object;
    components?: ComponentsContract;
    utils?: any;
}