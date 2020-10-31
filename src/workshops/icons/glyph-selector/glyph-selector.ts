
import * as ko from "knockout";
import * as Utils from "@paperbits/common";
import template from "./glyph-selector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { OpenTypeFontGlyph } from "../../../openType/openTypeFontGlyph";
import { OpenTypeFont } from "../../../openType/openTypeFont";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";
import { FontContract } from "../../../contracts";
import { StyleService } from "../../../styleService";
import { formatUnicode } from "../../../styleUitls";
import { StyleCompiler } from "@paperbits/common/styles";

export interface GlyphItem {
    name: string;
    font: OpenTypeFont;
    glyph: OpenTypeFontGlyph;
}

@Component({
    selector: "glyph-selector",
    template: template
})
export class GlyphSelector {
    public readonly working: ko.Observable<boolean>;
    public allIcons: any[];
    public icons: ko.ObservableArray;
    public compiledFontStyles: ko.Observable<string>;

    constructor(
        private readonly styleService: StyleService,
        private readonly styleCompiler: StyleCompiler
    ) {
        this.working = ko.observable(true);
        this.fonts = ko.observableArray();
        this.searchPattern = ko.observable("");
        this.compiledFontStyles = ko.observable();
        this.icons = ko.observableArray();
    }

    @Param()
    public fonts: ko.ObservableArray<FontContract>;

    @Param()
    public searchPattern: ko.Observable<string>;

    @Param()
    public showFontNames: ko.Observable<boolean>;

    @Event()
    public onSelect: (glyph: any) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        const fontStyles = await this.styleCompiler.getIconFontStylesCss();
        this.compiledFontStyles(fontStyles);

        this.searchPattern
            .extend(ChangeRateLimit)
            .subscribe(this.searchIcons);

        const icons = await this.styleService.getIcons();
        const iconViewModels = icons.map(icon => ({
            key: icon.key,
            class: Utils.camelCaseToKebabCase(icon.key.replace("icons/", "icon-")),
            displayName: icon.displayName,
            unicode: formatUnicode(icon.unicode)
        }));

        this.allIcons = iconViewModels;
        this.icons(iconViewModels);
        this.working(false);
    }

    private searchIcons(pattern: string = ""): void {
        this.working(true);

        pattern = pattern.toLowerCase();
        const filteredIcons = this.allIcons.filter(icon => icon.displayName.toLowerCase().includes(pattern));
        this.icons(filteredIcons);

        this.working(false);
    }

    public async selectIcon(icon: any): Promise<void> {
        if (this.onSelect) {
            this.onSelect(icon);
        }
    }

    public selectNone(): void {
        if (this.onSelect) {
            this.onSelect(null);
        }
    }
}