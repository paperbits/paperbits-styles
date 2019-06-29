import * as ko from "knockout";
import jss from "jss";
import { Style } from "@paperbits/common/styles";


ko.bindingHandlers["jss"] = {
    update: (element: HTMLStyleElement, valueAccessor: () => Style) => {
        const styleSheet = ko.unwrap(valueAccessor());

        if (!styleSheet) {
            element.innerHTML = "";
            return;
        }

        const jssObject = JSON.parse(styleSheet.toJssString());
        const styleSheetCss = jss.createStyleSheet(jssObject).toString();

        element.innerHTML = styleSheetCss;
    }
};