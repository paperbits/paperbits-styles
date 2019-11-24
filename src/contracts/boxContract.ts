import { StylePluginConfig } from "@paperbits/common/styles";
import { PaddingStylePluginConfig } from "../plugins/padding";
import { BorderRadiusStylePluginConfig, BorderStylePluginConfig, MarginStylePluginConfig, TypographyStylePluginConfig } from "./";

export interface BoxStylePluginConfig extends StylePluginConfig {
    padding?: PaddingStylePluginConfig;
    margin?: MarginStylePluginConfig;
    border?: BorderStylePluginConfig;
    borderRadius?: BorderRadiusStylePluginConfig;
    typography?: TypographyStylePluginConfig;
}