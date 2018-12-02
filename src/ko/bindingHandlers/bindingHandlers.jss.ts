import * as ko from "knockout";
import jss from "jss";
import preset from "jss-preset-default";


ko.bindingHandlers["jss"] = {
    update: (element: HTMLStyleElement, valueAccessor) => {
        const jssObject = ko.unwrap(valueAccessor());
        const styleSheet = jssObject ? jss.createStyleSheet(jssObject).toString() : "";

        element.innerHTML = styleSheet;
    }
};