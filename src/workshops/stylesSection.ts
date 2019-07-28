import { IToolButton, IViewManager } from "@paperbits/common/ui";

export class StylesWorkshopSection implements IToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-palette";
    public readonly title: string = "Styles";
    public readonly helpText: string = "Manage website global styles.";

    constructor(private readonly viewManager: IViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();
        this.viewManager.setHost({ name: "style-guide" });
    }
}