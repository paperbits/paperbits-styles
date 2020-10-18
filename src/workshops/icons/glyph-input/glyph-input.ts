import * as ko from "knockout";
import * as Objects from "@paperbits/common/objects";
import template from "./glyph-input.html";
import { Component, Event, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../..";
import { FontContract, FontGlyphContract } from "../../../contracts";

@Component({
    selector: "glyph-input",
    template: template
})
export class GlyphInput {
    public readonly selectedIconDisplay: ko.Observable<string>;
    public readonly iconFont: ko.Observable<FontContract>;

    constructor(private readonly styleService: StyleService) {
        this.selectedIconDisplay = ko.observable(`Click to select icon...`);
        this.iconFont = ko.observable();
    }

    @Param()
    public selection: string;

    @Event()
    public readonly onChange: (iconKey: string) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        const iconFont = await this.styleService.getIconFont();
        this.iconFont(iconFont);

        const styles = await this.styleService.getStyles();
        const iconKey = this.selection;

        if (iconKey) {
            const icon = Objects.getObjectAt<FontGlyphContract>(iconKey, styles);

            if (icon) {
                this.selectedIconDisplay(icon.displayName);
            }
        }
    }

    public async onGlyphSelected(icon: any): Promise<void> {
        let key: string = null;

        if (icon) {
            this.selectedIconDisplay(icon.displayName);
            key = icon.key;
        }
        else {
            this.selectedIconDisplay(`Click to select icon...`);
        }

        if (this.onChange) {
            this.onChange(key);
        }
    }
}