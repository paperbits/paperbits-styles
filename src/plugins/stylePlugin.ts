import jss from "jss";
import preset from "jss-preset-default";

export abstract class StylePlugin {
    public displayName: string;

    public abstract contractToJss(contract): Promise<object>;

    public jssToCss?(jssObject): string {
        const styleSheet = jss.createStyleSheet(jssObject);

        return styleSheet.toString();
    }
}