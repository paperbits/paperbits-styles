import jss from "jss";
import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import { ShadowContract } from "../../contracts/shadowContract";


ko.bindingHandlers["shadowPreview"] = {
    update: (element: HTMLStyleElement, valueAccessor: () => ShadowContract) => {
        const shadowContract = ko.unwrap(valueAccessor());
        const key = Utils.camelCaseToKebabCase(shadowContract.key).replace("/", "-");

        const jssObject = {
            [key]: {
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