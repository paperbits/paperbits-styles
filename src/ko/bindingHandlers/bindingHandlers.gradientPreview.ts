import { LinearGradientContract, getLinearGradientString } from "./../../contracts/linearGradientContract";
import * as ko from "knockout";
import jss from "jss";


ko.bindingHandlers["gradientPreview"] = {
    update: (element: HTMLStyleElement, valueAccessor: () => LinearGradientContract) => {
        const linearGradientContract = ko.unwrap(valueAccessor());

        const jssObject = {
            [linearGradientContract.key]: {
                backgroundImage: getLinearGradientString(linearGradientContract)
            }
        };

        const styleSheet = jssObject ? jss.createStyleSheet(jssObject).toString() : "";

        element.innerHTML = styleSheet;
    }
};