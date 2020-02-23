import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import { LinearGradientContract, getLinearGradientString } from "./../../contracts/linearGradientContract";
import { Style, StyleRule, StyleSheet } from "@paperbits/common/styles";
import { JssCompiler } from "../../jssCompiler";


ko.bindingHandlers["gradientPreview"] = {
    update: (element: HTMLStyleElement, valueAccessor: () => LinearGradientContract) => {
        const linearGradientContract = ko.unwrap(valueAccessor());
        const key = Utils.camelCaseToKebabCase(linearGradientContract.key).replace("/", "-");

        const gradientStyleRule = new StyleRule("background-image", getLinearGradientString(linearGradientContract));
        const style = new Style(key);
        style.addRule(gradientStyleRule);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        const compiler = new JssCompiler();
        const css = compiler.compile(styleSheet);
        element.innerHTML = css;
    }
};