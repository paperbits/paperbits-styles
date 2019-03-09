import { ShadowContract } from "../../contracts/shadowContract";
import * as ko from "knockout";
import jss from "jss";


ko.bindingHandlers["shadowPreview"] = {
    update: (element: HTMLStyleElement, valueAccessor: () => ShadowContract) => {
        const shadowContract = ko.unwrap(valueAccessor());

        const jssObject = {
            [shadowContract.key]: {
                boxShadow: {
                    x: shadowContract.offsetX || 0,
                    y: shadowContract.offsetY || 0,
                    blur: shadowContract.blur || 0,
                    spread: shadowContract.spread || 0,
                    color: shadowContract.color || "#000",
                    inset: shadowContract.inset ? "inset" : undefined
                }
            }
        };

        const styleSheet = jssObject ? jss.createStyleSheet(jssObject).toString() : "";

        element.innerHTML = styleSheet;
    }
};