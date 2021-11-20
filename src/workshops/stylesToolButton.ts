import { ToolButton, ViewManager } from "@paperbits/common/ui";

const helpText = "<h1>Styles</h1><p>Manage your website global styles.</p>";

export class StylesToolButton implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-palette";
    public readonly title: string = "Styles";
    public readonly tooltip: string = helpText;

    constructor(private readonly viewManager: ViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();
        this.viewManager.setHost({ name: "style-guide" }, true);
    }
}