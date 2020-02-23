import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import { ShadowContract } from "../../contracts/shadowContract";
import { ShadowStylePlugin } from "../../plugins";
import { Style, StyleSheet } from "@paperbits/common/styles";
import { JssCompiler } from "../../jssCompiler";


ko.bindingHandlers["shadowPreview"] = {
    update: (element: HTMLStyleElement, valueAccessor: () => ShadowContract) => {
        const shadowContract = ko.unwrap(valueAccessor());
        const key = Utils.camelCaseToKebabCase(shadowContract.key).replace("/", "-");

        const shadowStyleRules = ShadowStylePlugin.contractToStyleRules(shadowContract);
        const style = new Style(key);
        style.addRules(shadowStyleRules);

        const styleSheet = new StyleSheet();
        styleSheet.styles.push(style);

        const compiler = new JssCompiler();
        const css = compiler.compile(styleSheet);
        element.innerHTML = css;
    }
};