import { StylePluginConfig } from "@paperbits/common/styles";

export interface TypographyStylePluginConfig extends StylePluginConfig {
    fontKey?: string;
    fontSize?: string | number;
    fontWeight?: string | number;
    fontStyle?: string | number;
    colorKey?: string;
    shadowKey?: string;
    textAlign?: string;
    textTransform?: string;
    textDecoration?: string;
    lineHeight?: string;
}
