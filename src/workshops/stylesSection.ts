import { IWorkshopSection, IViewManager } from "@paperbits/common/ui";

export class StylesWorkshopSection implements IWorkshopSection {
    public iconClass = "paperbits-icon paperbits-palette";
    public title = "Styles";

    constructor(private readonly viewManager: IViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();
        this.viewManager.setHost({ name: "style-guide" });
    }
}