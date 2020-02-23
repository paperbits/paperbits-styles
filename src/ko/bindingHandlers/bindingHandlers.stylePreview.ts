import * as ko from "knockout";
import { StyleCompiler } from "@paperbits/common/styles";
import { StyleService } from "../..";
import { JssCompiler } from "../../jssCompiler";

/* The task of this handler is to assign classes, not styles */

export class StylePreviewBindingHandler {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly styleService: StyleService
    ) {
        ko.bindingHandlers["stylePreview"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const config = ko.unwrap(valueAccessor());

                let styleConfig;

                if (typeof config === "string") {
                    styleConfig = await this.styleService.getStyleByKey(config);
                }
                else {
                    styleConfig = config;
                }



                if (!styleConfig) {
                    return;
                }

                let classNames: string;
                const cssObservable = ko.observable();

                if (typeof styleConfig === "string" || styleConfig instanceof String) {
                    classNames = await this.styleCompiler.getClassNameByStyleKeyAsync(<string>styleConfig);
                }
                else {
                    if (styleConfig.key) {
                        classNames = await this.styleCompiler.getClassNameByStyleKeyAsync(styleConfig.key);
                    }
                    else {
                        const styleModel = await this.styleCompiler.getStyleModelAsync(styleConfig);
                        classNames = styleModel.classNames;

                        const styleElement = document.createElement("style");
                        const compiler = new JssCompiler();
                        const css = compiler.compile(styleModel.styleSheet);
                        styleElement.innerHTML = css;
                        element.parentElement.insertBefore(styleElement, element);
                    }
                }

                cssObservable(classNames);

                ko.applyBindingsToNode(element, { css: cssObservable }, null);
            }
        };
    }
}