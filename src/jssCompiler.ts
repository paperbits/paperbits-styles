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

    private getRulesJssString(style: Style): string {
        const rules = style.rules.map(rule => rule.toJssString()).filter(x => !!x).join(",");
        const modifierStyles = style.modifierStyles.map(s => `"&.${s.selector}": ${s.getRulesJssString()}`).filter(x => !!x).join(",");
        const pseudoStyles = style.pseudoStyles.map(s => `"&:${s.selector}": ${s.getRulesJssString()}`).filter(x => !!x).join(",");
        const nestedStyles = style.nestedStyles.map(s => `"& .${s.selector}": ${s.getRulesJssString()}`).filter(x => !!x).join(",");
        const jssString = `{ ${[rules, modifierStyles, pseudoStyles, nestedStyles /*, nestedMediaQueries*/].filter(x => !!x).join(",")} }`;

        return jssString;
    }

    private flattenMediaQueries(styles: Style[]): StyleMediaQuery[] {
        const nestedMediaQueries = styles.map(x => x.nestedMediaQueries);
        const flattenNestedMediaQueries = nestedMediaQueries.reduce((acc, next) => acc.concat(next), []);
        const groupedMediaQueries = [];

        for (const breakpointMinWidth of Object.values(BreakpointValues)) {
            const mediaQuery = new StyleMediaQuery(breakpointMinWidth);
            flattenNestedMediaQueries
                .filter(x => x.minWidth === breakpointMinWidth)
                .forEach(x => mediaQuery.styles.push(...x.styles));

            groupedMediaQueries.push(mediaQuery);
        }

        return groupedMediaQueries;
    }

    public styleToCss(style: Style): string {
        // const jssObject = JSON.parse(allStyles.toJssString());
        // const styleSheet = jss.createStyleSheet(jssObject);
        return null;

    }

    public styleSheetToCss(styleSheet: StyleSheet): string {
        const fontFacesJssString = `"@font-face":[${styleSheet.fontFaces.map(x => x.toJssString()).join(",")}]`;
        const stylesJssString = styleSheet.styles.map(style => style.toJssString()).filter(x => !!x).join(",");
        const mediaQueries = this.flattenMediaQueries(styleSheet.styles);
        const mediaQueriesJssString = mediaQueries.map(x => x.toJssString()).filter(x => !!x).join(",");
        const result = [fontFacesJssString, stylesJssString, mediaQueriesJssString].filter(x => !!x).join(",");
        const jssString = `{${result}}`;
        const jssObject = JSON.parse(jssString);
        const css = jss.createStyleSheet(jssObject).toString();

        return css;
    }
}