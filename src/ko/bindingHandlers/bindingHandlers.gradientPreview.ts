import jss from "jss";
import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import { LinearGradientContract, getLinearGradientString } from "./../../contracts/linearGradientContract";


ko.bindingHandlers["gradientPreview"] = {
    update: (element: HTMLStyleElement, valueAccessor: () => LinearGradientContract) => {
        const linearGradientContract = ko.unwrap(valueAccessor());
        const key = Utils.camelCaseToKebabCase(linearGradientContract.key).replace("/", "-");

        const jssObject = {
            [key]: {
                backgroundImage: getLinearGradientString(linearGradientContract)
            }
        };

        const styleSheet = jssObject ? jss.createStyleSheet(jssObject).toString() : "";

        element.innerHTML = styleSheet;
    }
};