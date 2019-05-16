import { IToolButton, IViewManager } from "@paperbits/common/ui";

export class StylesWorkshopSection implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-palette";
    public title: string = "Styles";

    constructor(private readonly viewManager: IViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();
        this.viewManager.setHost({ name: "style-guide" });
    }
}