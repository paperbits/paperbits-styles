import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import { Style, StyleSheet } from "@paperbits/common/styles";
import { ShadowContract } from "../../contracts/shadowContract";
import { ShadowStylePlugin } from "../../plugins";
import { JssCompiler } from "../../jssCompiler";


export class ShadowPreviewBindingHandler {
    constructor() {
        const shadowStylePlugin = new ShadowStylePlugin();
        const compiler = new JssCompiler();

        ko.bindingHandlers["shadowPreview"] = {
            update: (element: HTMLStyleElement, valueAccessor: () => ShadowContract) => {
                const shadowContract = ko.unwrap(valueAccessor());
                const key = Utils.camelCaseToKebabCase(shadowContract.key).replace("/", "-");
                const shadowStyleRules = shadowStylePlugin.contractToStyleRules(shadowContract);
                const style = new Style(key);
                style.addRules(shadowStyleRules);
        
                const styleSheet = new StyleSheet();
                styleSheet.styles.push(style);
               
                const css = compiler.compile(styleSheet);
                element.innerHTML = css;
            }
        };
    }
}
