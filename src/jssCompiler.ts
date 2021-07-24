import jss from "jss";
import preset from "jss-preset-default";
import * as Utils from "@paperbits/common/utils";
import { Style, StyleSheet, StyleMediaQuery, BreakpointValues, FontFace } from "@paperbits/common/styles";

const opts = preset();

opts.createGenerateId = () => {
    return (rule, sheet) => {
        return Utils.camelCaseToKebabCase(rule.key);
    };
};

jss.setup(opts);

/**
 * JSS style compiler. Converts style sheet structures into CSS.
 */
export class JssCompiler {
    private flattenMediaQueries(styles: Style[], globalStyles: Style[]): StyleMediaQuery[] {
        const groupedMediaQueries = [];

        for (const breakpointMinWidth of Object.values(BreakpointValues)) {
            const mediaQuery = new StyleMediaQuery(breakpointMinWidth);

            styles.forEach(x => {
                const breakpointStyle = this.extractBreakpointStyle(x, breakpointMinWidth);
                mediaQuery.styles.push(breakpointStyle);
            });

            globalStyles.forEach(x => {
                const breakpointStyle = this.extractBreakpointStyle(x, breakpointMinWidth);
                mediaQuery.globalStyles.push(breakpointStyle);
            });

            groupedMediaQueries.push(mediaQuery);
        }

        return groupedMediaQueries;
    }

    private extractBreakpointStyle(style: Style, minWidth: number): Style {
        const mediaQuery = style.nestedMediaQueries.find(x => x.minWidth === minWidth);

        const styleInMediaQuery = !!mediaQuery
            ? mediaQuery.styles[0]
            : new Style(style.selector);

        const extractedModifierStyles = style.modifierStyles
            .map(modifierStyle => this.extractBreakpointStyle(modifierStyle, minWidth))
            .filter(modifierStyle => !!modifierStyle);

        styleInMediaQuery.modifierStyles = extractedModifierStyles;

        const extractedNestedStyles = style.nestedStyles
            .map(nestedStyle => this.extractBreakpointStyle(nestedStyle, minWidth))
            .filter(nestedStyle => !!nestedStyle);

        styleInMediaQuery.nestedStyles = extractedNestedStyles;

        return styleInMediaQuery;
    }

    private styleSheetToCss(styleSheet: StyleSheet): string {
        const globalStyles = styleSheet.globalStyles.map(style => this.styleToJssString(style)).filter(x => !!x).join(",");
        const globalJssString = `{ "@global": { ${globalStyles} } }`;
        const globalJssObject = JSON.parse(globalJssString);
        const globalCss = jss.createStyleSheet(globalJssObject).toString();
        const fontFacesJssString = `"@font-face":[${styleSheet.fontFaces.map(x => this.fontFaceToJssString(x)).join(",")}]`;
        const stylesJssString = styleSheet.styles.map(style => this.styleToJssString(style)).filter(x => !!x).join(",");
        const mediaQueries = this.flattenMediaQueries(styleSheet.styles, styleSheet.globalStyles);
        const mediaQueriesJssString = mediaQueries.map(x => this.mediaQueryToJssString(x)).filter(x => !!x).join(",");
        const result = [fontFacesJssString, stylesJssString, mediaQueriesJssString].filter(x => !!x).join(",");
        const jssString = `{${result}}`;
        const jssObject = JSON.parse(jssString);
        const css = jss.createStyleSheet(jssObject).toString();

        return `${globalCss} ${css}`;
    }

    private fontFaceToJssString(fontFace: FontFace): string {
        const jssString = `{
            "src": "url(${fontFace.source})",
            "fontFamily": "${fontFace.fontFamily}",
            "fontStyle": "${fontFace.fontStyle}",
            "fontWeight": "${fontFace.fontWeight}"
        }`;
        return jssString;
    }

    private mediaQueryToJssString(mediaQuery: StyleMediaQuery): string {
        const stylesJss = mediaQuery.styles.map(style => this.styleToJssString(style)).join();
        const globalStylesJss = mediaQuery.globalStyles.map(style => this.styleToJssString(style)).join();

        const general = !!stylesJss
            ? stylesJss
            : "";

        const global = !!globalStylesJss
            ? `"@global": {${globalStylesJss}}`
            : "";

        const jssString = `"@media(min-width:${mediaQuery.minWidth}px)":{${[global, general].filter(x => !!x).join(",")}}`;

        return jssString;
    }

    private styleRulesToJssString(style: Style): string {
        const rules = style.rules.filter(x => !!x.value)
            .map(rule => rule.toJssString())
            .filter(stylesJss => !!stylesJss)
            .join(",");

        const modifierStyles = style.modifierStyles
            .map(style => `"&.${style.selector}": ${this.styleRulesToJssString(style)}`)
            .filter(stylesJss => !!stylesJss)
            .join(",");

        const pseudoStyles = style.pseudoStyles
            .map(style => `"&:${style.selector}": ${this.styleRulesToJssString(style)}`)
            .filter(stylesJss => !!stylesJss)
            .join(",");

        const nestedStyles = style.nestedStyles
            .map(style => `"& .${style.selector}": ${this.styleRulesToJssString(style)}`)
            .filter(stylesJss => !!stylesJss)
            .join(",");

        const nestedGloablStyles = style.nestedGlobalStyles
            .map(style => `"& ${style.selector}": ${this.styleRulesToJssString(style)}`)
            .filter(stylesJss => !!stylesJss)
            .join(",");

        const jssString = `{ ${[rules, modifierStyles, pseudoStyles, nestedStyles, nestedGloablStyles /*, nestedMediaQueries*/]
            .filter(stylesJss => !!stylesJss)
            .join(",")} }`;

        return jssString;
    }

    private styleToJssString(style: Style): string {
        const rulesJssString = this.styleRulesToJssString(style);
        const jssString = `"${style.selector}":${rulesJssString}`;

        return jssString;
    }

    /**
     * Converts style sheet structures into CSS.
     * @param styleSheets {StyleSheets[]} Style sheets.
     * @returns {string} Compiled CSS string.
     */
    public compile(...styleSheets: StyleSheet[]): string {
        return styleSheets
            .map((styleSheet) => this.styleSheetToCss(styleSheet))
            .join(" ")
            .replace(/\n/g, "")
            .replace(/\s\s+/g, " ");
    }
}