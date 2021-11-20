import { ToolButton, ViewManager } from "@paperbits/common/ui";

export class StylesWorkshopSection implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-palette";
    public readonly title: string = "Styles";
    public readonly helpText: string = "Manage website global styles.";

    constructor(private readonly viewManager: ViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();
        this.viewManager.setHost({ name: "style-guide" }, true);
    }
}