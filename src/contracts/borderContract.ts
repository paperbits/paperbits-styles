export interface BorderStyle {
    width?: string | number;
    style?: string;
    color?: string;
    colorKey?: string;
}

export interface BorderStylePluginConfig {
    top?: BorderStyle;
    left?: BorderStyle;
    right?: BorderStyle;
    bottom?: BorderStyle;
}

export interface BorderRadiusStylePluginConfig {
    topLeftRadius?: string | number;
    topRightRadius?: string | number;
    bottomLeftRadius?: string | number;
    bottomRightRadius?: string | number;
}