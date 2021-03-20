import jss from "jss";
import preset from "jss-preset-default";
import * as Utils from "@paperbits/common/utils";
import { StyleRule, Style, StyleSheet, StyleMediaQuery, StyleAnimation, BreakpointValues, FontFace } from "@paperbits/common/styles";
import { AnimationContract } from "./contracts";

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
        const nestedMediaQueries = styles.map(x => x.nestedMediaQueries);
        const flattenNestedMediaQueries = nestedMediaQueries.reduce((acc, next) => acc.concat(next), []);
        const nestedGlobalMediaQueries = globalStyles.map(x => x.nestedMediaQueries);
        const flattenNestedGlobalMediaQueries = nestedGlobalMediaQueries.reduce((acc, next) => acc.concat(next), []);

        const groupedMediaQueries = [];

        for (const breakpointMinWidth of Object.values(BreakpointValues)) {
            const mediaQuery = new StyleMediaQuery(breakpointMinWidth);

            flattenNestedMediaQueries
                .filter(x => x.minWidth === breakpointMinWidth)
                .forEach(x => mediaQuery.styles.push(...x.styles));

            flattenNestedGlobalMediaQueries
                .filter(x => x.minWidth === breakpointMinWidth)
                .forEach(x => mediaQuery.globalStyles.push(...x.styles));

            groupedMediaQueries.push(mediaQuery);
        }

        return groupedMediaQueries;
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

    private animationToJssString(animation: StyleAnimation): string {
        // const styles = {
        //     '@keyframes slideRight': {
        //       from: {opacity: 0},
        //       to: {opacity: 1}
        //     },
        //     container: {
        //       animationName: '$slideRight'
        //     }
        //   }

        const keyframePropName = `@keyframes ${animation.name}`;

        let stepsString = "";

        for (const frame of animation.frames) {
            stepsString += `${frame.step}%`;
        }

        const styles: any = {
            [keyframePropName]: {
                from: { opacity: 0 },
                to: { opacity: 1 }
            }
        };

        return JSON.stringify(styles);
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
        const rules = style.rules.filter(x => !!x.value).map(rule => rule.toJssString()).filter(x => !!x).join(",");
        const modifierStyles = style.modifierStyles.map(style => `"&.${style.selector}": ${this.styleRulesToJssString(style)}`).filter(x => !!x).join(",");
        const pseudoStyles = style.pseudoStyles.map(style => `"&:${style.selector}": ${this.styleRulesToJssString(style)}`).filter(x => !!x).join(",");
        const nestedStyles = style.nestedStyles.map(style => `"& .${style.selector}": ${this.styleRulesToJssString(style)}`).filter(x => !!x).join(",");
        const nestedGloablStyles = style.nestedGlobalStyles.map(style => `"& ${style.selector}": ${this.styleRulesToJssString(style)}`).filter(x => !!x).join(",");
        const jssString = `{ ${[rules, modifierStyles, pseudoStyles, nestedStyles, nestedGloablStyles /*, nestedMediaQueries*/].filter(x => !!x).join(",")} }`;

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