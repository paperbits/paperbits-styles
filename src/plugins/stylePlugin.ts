import jss from "jss";

export abstract class StylePlugin {
    protected name: string;

    public abstract contractToJss(contract): Promise<object>;

    public jssToCss?(jssObject): string {
        const styleSheet = jss.createStyleSheet(jssObject);

        return styleSheet.toString();
    }

    protected parseSize = (value: string | number): any => {
        if (value === "auto" || value === "initial") {
            return value;
        }

        if (value) {
            return parseInt(<string>value);
        }
        else {
            return undefined;
        }
    };
}