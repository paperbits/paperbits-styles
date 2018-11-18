import * as ko from "knockout";
import { IView, IViewManager } from "@paperbits/common/ui";
import { IEventManager } from "@paperbits/common/events";


export class StyleableBindingHandler {
    constructor(
        private readonly viewManager: IViewManager,
        private readonly eventManager: IEventManager
    ) {
        ko.bindingHandlers["stylable"] = {
            init: (element: HTMLElement, valueAccessor) => {
                const config = ko.unwrap(valueAccessor());

                ko.applyBindingsToNode(element, {
                    click: (ignored, event: MouseEvent) => {
                        event.preventDefault();
                        event.stopImmediatePropagation();

                        const view: IView = {
                            heading: config.elementStyle.displayName,
                            component: {
                                name: "style-editor",
                                params: {
                                    elementStyle: config.elementStyle,
                                    onUpdate: () => {
                                        this.eventManager.dispatchEvent("onStyleChange");
                                    }
                                }
                            },
                            resize: "vertically horizontally"
                        };

                        this.viewManager.openViewAsPopup(view);
                    },

                    styled: config.elementStyle.key
                });
            }
        };
    }
}