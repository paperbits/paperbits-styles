import { PaddingStylePluginConfig } from "../plugins/padding";
import {
    MarginStylePluginConfig,
    BorderStylePluginConfig,
    BorderRadiusStylePluginConfig,
    TypographyStylePluginConfig
} from "./";

export interface BoxStylePluginConfig {
    displayName?: string;
    padding?: PaddingStylePluginConfig;
    margin?: MarginStylePluginConfig;
    border?: BorderStylePluginConfig;
    borderRadius?: BorderRadiusStylePluginConfig;
    typography?: TypographyStylePluginConfig;
}