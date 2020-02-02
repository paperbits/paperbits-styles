import * as ko from "knockout";
import { EventManager } from "@paperbits/common/events";
import { JssCompiler } from "../../jssCompiler";
import { StyleSheet } from "@paperbits/common/styles";


// @BindingHandlers("stylesheet")
export class StylesheetBindingHandler {
    constructor(private readonly eventManager: EventManager) {
        const compiler = new JssCompiler();

        ko.bindingHandlers["styleSheet"] = {
            init: (element: HTMLStyleElement) => {
                const applyStyleSheet = (styleSheet: StyleSheet): void => {
                    const css = compiler.styleSheetToCss(styleSheet);
                    const nodes = Array.prototype.slice.call(element.childNodes);

                    let stylesTextNode = nodes.find(x => x["key"] === styleSheet.key);

                    if (!stylesTextNode) {
                        stylesTextNode = document.createTextNode(css);
                        stylesTextNode["key"] = styleSheet.key;
                        element.appendChild(stylesTextNode);
                    }

                    stylesTextNode.textContent = css;
                };

                const removeStyleSheet = (key: string) => {
                    if (!key) {
                        return;
                    }

                    const nodes = Array.prototype.slice.call(element.childNodes);
                    const node = nodes.find(x => x["key"] === key);

                    if (node) {
                        element.removeChild(node);
                    }
                };

                this.eventManager.addEventListener("onStyleChange", applyStyleSheet);
                this.eventManager.addEventListener("onStyleRemove", removeStyleSheet);
            }
        };
    }
}