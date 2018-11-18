import { PaddingContract, MarginContract, BorderContract, BorderRadiusContract, ShadowContract, TypographyContract } from "./";

export interface BoxContract {
    displayName?: string;
    padding?: PaddingContract;
    margin?: MarginContract;
    border?: BorderContract;
    borderRadius?: BorderRadiusContract;
    shadow?: string;
    typography?: TypographyContract;
}