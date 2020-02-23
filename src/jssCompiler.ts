import jss from "jss";
import preset from "jss-preset-default";
import * as Utils from "@paperbits/common/utils";
import { Style, StyleSheet, StyleMediaQuery, BreakpointValues } from "@paperbits/common/styles";

const opts = preset();

opts.createGenerateId = () => {
    return (rule, sheet) => {
        return Utils.camelCaseToKebabCase(rule.key);
    };
};

jss.setup(opts);

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

    public compile(...styleSheets: StyleSheet[]): string {
        return styleSheets.map((val) => this.styleSheetToCss(val)).join(" ");
    }

    private styleSheetToCss(styleSheet: StyleSheet): string {
        const globalStyles = styleSheet.globalStyles.map(style => style.toJssString()).filter(x => !!x).join(",");
        const globalJssString = `{ "@global": { ${globalStyles} } }`;
        const globalJssObject = JSON.parse(globalJssString);
        const globalCss = jss.createStyleSheet(globalJssObject).toString();
        const fontFacesJssString = `"@font-face":[${styleSheet.fontFaces.map(x => x.toJssString()).join(",")}]`;
        const stylesJssString = styleSheet.styles.map(style => style.toJssString()).filter(x => !!x).join(",");
        const mediaQueries = this.flattenMediaQueries(styleSheet.styles, styleSheet.globalStyles);
        const mediaQueriesJssString = mediaQueries.map(x => x.toJssString()).filter(x => !!x).join(",");
        const result = [fontFacesJssString, stylesJssString, mediaQueriesJssString].filter(x => !!x).join(",");
        const jssString = `{${result}}`;
        const jssObject = JSON.parse(jssString);
        const css = jss.createStyleSheet(jssObject).toString();

        return `${globalCss} ${css}`;
    }
}