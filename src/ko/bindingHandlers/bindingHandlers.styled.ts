import * as ko from "knockout";
import { StyleModel } from "@paperbits/common/styles";


export class StyledBindingHandler {
    constructor() {
        ko.bindingHandlers["styled"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const styleModel: StyleModel = ko.unwrap(valueAccessor());

                if (!styleModel) {
                    return;
                }

                styleModel.styleManager.setStyleSheet(styleModel.styleSheet);

                ko.applyBindingsToNode(element, { css: styleModel.classNames }, null);

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    styleModel.styleManager.removeStyleSheet(styleModel.key);
                });
            }
        };
    }
}