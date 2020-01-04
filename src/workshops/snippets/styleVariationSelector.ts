import * as ko from "knockout";
import template from "./styleVariationSelector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleCompiler, IStyleGroup, StyleContract } from "@paperbits/common/styles";
import { StyleItem } from "../../models/styleItem";
import { DefaultStyleCompiler } from "../../defaultStyleCompiler";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { ThemeContract } from "../../contracts/themeContract";
import { StyleService } from "../../styleService";


@Component({
    selector: "style-variation-selector",
    template: template
})
export class StyleVariationSelector {
    public readonly working: ko.Observable<boolean>;
    public readonly selectedSnippet: ko.Observable<StyleItem>;
    public readonly snippets: ko.ObservableArray<StyleItem>;
    public itemTemplate: string;

    private readonly snippetStyleCompiler: StyleCompiler;

    @Param()
    public snippetType: string;

    @Event()
    public readonly onSelect: (snippet: StyleItem) => void;

    constructor(
        private readonly styleService: StyleService,
        private readonly mediaPermalinkResolver: IPermalinkResolver,
        private readonly styleGroups: IStyleGroup[]) {

        this.snippetStyleCompiler = new DefaultStyleCompiler(undefined, this.mediaPermalinkResolver);
        this.loadSnippets = this.loadSnippets.bind(this);
        this.selectSnippet = this.selectSnippet.bind(this);

        this.snippets = ko.observableArray();
        this.selectedSnippet = ko.observable();
        this.working = ko.observable(true);
    }

    @OnMounted()
    public async loadSnippets(): Promise<void> {
        if (!this.snippetType) {
            return;
        }
        this.working(true);

        const snippetsByType = await this.styleService.getStyleByKey(this.snippetType);
        this.itemTemplate = this.getSnippetTypeTemplate(this.snippetType);
        const loadedSnippets = [];
        for (const it of Object.values(snippetsByType)) {
            const item = <StyleContract>it;
            const subTheme = await this.loadThemeForItem(item);
            const styleItem = new StyleItem(item, subTheme, this.snippetType);
            const compiller = this.getStyleCompiler(subTheme);
            styleItem.stylesContent = await compiller.compileCss();
            styleItem.classNames = await compiller.getClassNameByStyleKeyAsync(item.key);
            loadedSnippets.push(styleItem);
        }

        this.snippets(loadedSnippets);
        this.working(false);
    }

    private getSnippetTypeTemplate(snippetType: string): string {
        const group = this.styleGroups.find(item => item.name === snippetType.replaceAll("/", "_"));
        return group ? group.selectorTemplate : "";
    }

    private async loadThemeForItem(item: StyleContract): Promise<ThemeContract> {
        const parts = item.key.split("/");
        const isComponent = parts[0] === "components";

        let styleKeys = this.getAllStyleKeys(item);

        if (isComponent && parts[2] !== "default") {
            const defaultKey = `${parts[0]}/${parts[1]}/default`;

            try {
                const defaultItem = await this.styleService.getStyleByKey(defaultKey);
                const defaultKeys = this.getAllStyleKeys(defaultItem);
                styleKeys.push(...defaultKeys);
            }
            catch (ex) {
                // Do nothing
            }
        }

        const itemTheme: ThemeContract = {};
        styleKeys = styleKeys.filter((item, index, source) => source.indexOf(item) === index);

        for (const styleKey of styleKeys) {
            try {
                const styleValue = await this.styleService.getStyleByKey(styleKey);

                if (styleValue) {
                    this.mergeNestedObj(itemTheme, styleKey, styleValue);
                }
                else {
                    console.warn(`Style with key "${styleKey}" not found: `);
                }
            }
            catch (ex) {
                // Do nothing
            }
        }

        return itemTheme;
    }

    private mergeNestedObj(source: any, path: string, value: any): void {
        const keys = path.split("/");
        const lastKey = keys.pop();
        const lastObj = keys.reduce((source, key) => source[key] = source[key] || {}, source);
        lastObj[lastKey] = value;
    }

    private getStyleCompiler(stylesConfig: ThemeContract): StyleCompiler {
        this.snippetStyleCompiler.setStyles(stylesConfig);
        return this.snippetStyleCompiler;
    }

    private getAllStyleKeys(source: any): string[] {
        const result: string[] = [];

        if (Array.isArray(source)) {
            source.every(x => result.push(... this.getAllStyleKeys(x)));
        }
        else if (typeof source === "object") {
            const propertyNames = Object.keys(source);

            for (const propertyName of propertyNames) {
                const propertyValue = source[propertyName];

                if (propertyName.toLowerCase().endsWith("key")) {
                    result.push(propertyValue);
                }
                else {
                    if (typeof propertyValue === "object") {
                        result.push(... this.getAllStyleKeys(propertyValue));
                    }
                }
            }
        }

        return result;
    }

    public async selectSnippet(snippet: StyleItem): Promise<void> {
        // preview snippet
        const current = this.selectedSnippet();
        if (current) {
            current.hasFocus(false);
        }
        snippet.hasFocus(true);

        this.selectedSnippet(snippet);
        if (this.onSelect) {
            this.onSelect(snippet);
        }
    }
}