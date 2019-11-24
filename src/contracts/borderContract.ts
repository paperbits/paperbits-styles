import { StylePluginConfig } from "@paperbits/common/styles";

export interface BorderStyle {
    width?: string | number;
    style?: string;
    color?: string;
    colorKey?: string;
}

export interface BorderStylePluginConfig extends StylePluginConfig {
    top?: BorderStyle;
    left?: BorderStyle;
    right?: BorderStyle;
    bottom?: BorderStyle;
}

export interface BorderRadiusStylePluginConfig extends StylePluginConfig {
    topLeftRadius?: string | number;
    topRightRadius?: string | number;
    bottomLeftRadius?: string | number;
    bottomRightRadius?: string | number;
}