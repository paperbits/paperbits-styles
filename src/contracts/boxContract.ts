import { PaddingStylePluginConfig } from "../plugins/padding";
import {
    MarginStylePluginConfig,
    BorderStylePluginConfig,
    BorderRadiusStylePluginConfig,
    TypographyStylePluginConfig
} from "./";

export interface BoxContract {
    displayName?: string;
    padding?: PaddingStylePluginConfig;
    margin?: MarginStylePluginConfig;
    border?: BorderStylePluginConfig;
    borderRadius?: BorderRadiusStylePluginConfig;
    typography?: TypographyStylePluginConfig;
}