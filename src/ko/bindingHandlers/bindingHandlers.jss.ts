import * as ko from "knockout";
import { StyleSheet } from "@paperbits/common/styles";
import { JssCompiler } from "../../jssCompiler";


ko.bindingHandlers["jss"] = {
    update: (element: HTMLStyleElement, valueAccessor: () => StyleSheet) => {
        const styleSheet = ko.unwrap(valueAccessor());

        if (!styleSheet) {
            element.innerHTML = "";
            return;
        }

        const compiler = new JssCompiler();
        const css = compiler.compile(styleSheet);

        element.innerHTML = css;
    }
};