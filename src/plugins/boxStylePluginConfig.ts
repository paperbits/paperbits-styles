import { StylePluginConfig } from "@paperbits/common/styles";
import { PaddingStylePluginConfig } from "./padding";
import { BorderRadiusStylePluginConfig, BorderStylePluginConfig, MarginStylePluginConfig, TypographyStylePluginConfig } from "../plugins";

export interface BoxStylePluginConfig extends StylePluginConfig {
    padding?: PaddingStylePluginConfig;
    margin?: MarginStylePluginConfig;
    border?: BorderStylePluginConfig;
    borderRadius?: BorderRadiusStylePluginConfig;
    typography?: TypographyStylePluginConfig;
}