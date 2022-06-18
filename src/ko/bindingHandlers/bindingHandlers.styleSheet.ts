import * as ko from "knockout";
import { EventManager } from "@paperbits/common/events";
import { JssCompiler } from "../../jssCompiler";
import { BreakpointValues, StyleCompiler, StyleManager, StyleSheet } from "@paperbits/common/styles";
import { ViewManager } from "@paperbits/common/ui";


// @BindingHandlers("stylesheet")
export class StylesheetBindingHandler {
    constructor(private readonly eventManager: EventManager, private readonly viewManager: ViewManager, private styleCompiler: StyleCompiler) {
        const compiler = new JssCompiler();

        ko.bindingHandlers["styleSheet"] = {
            init: (element: HTMLStyleElement) => {
                const applyStyleSheet = (styleSheet: StyleSheet): void => {
                    const viewport = this.viewManager.getViewport();
                    const minWidth = BreakpointValues[viewport];

                    const css = compiler.compileForViewport(styleSheet, minWidth);
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

                const redrawStylesheet = async (): Promise<void> => {
                    const styleManager = new StyleManager(this.eventManager);
                    const styleSheet = await this.styleCompiler.getStyleSheet();
                    styleManager.setStyleSheet(styleSheet);

                    applyStyleSheet(styleSheet);
                }

                this.eventManager.addEventListener("onViewportChange", redrawStylesheet);

                this.eventManager.addEventListener("onStyleChange", applyStyleSheet);
                this.eventManager.addEventListener("onStyleRemove", removeStyleSheet);
            }
        };
    }
}