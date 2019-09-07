import * as ko from "knockout";
import template from "./styleAppearanceSelector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleItemContract } from "../../contracts/styleItemContract";
import { StyleItem } from "../../models/styleItem";
import { StyleCompiler } from "../../styleCompiler";
import { IPermalinkResolver } from "@paperbits/common/permalinks/IPermalinkResolver";
import { ThemeContract } from "../../contracts/themeContract";
import { StyleService } from "../../styleService";

@Component({
    selector: "style-appearance-selector",
    template: template,
    injectable: "styleAppearanceSelector"
})
export class StyleAppearanceSelector {    
    public readonly working: ko.Observable<boolean>;
    public readonly selectedSnippet: ko.Observable<StyleItem>;
    public readonly snippets: ko.ObservableArray<StyleItem>;
    public itemTemplate: string;

    private readonly snippetStyleCompiler: StyleCompiler;

    @Param()
    public snippetType: string;

    @Event()
    public readonly onSelect: (snippet: StyleItemContract) => void;

    constructor(
        private readonly styleService: StyleService,
        private readonly mediaPermalinkResolver: IPermalinkResolver) {

        this.snippetStyleCompiler = new StyleCompiler(undefined, this.mediaPermalinkResolver);
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
        this.itemTemplate = `<button data-bind="css: classNames, text: displayName"></button>`;
        const loadedSnippets = [];
        for (const it of Object.values(snippetsByType)) {
            const item = <StyleItemContract>it;
            const subTheme = await this.loadThemeForItem(item);
            const styleItem = new StyleItem(item, subTheme); 
            const compiller = this.getStyleCompiler(subTheme);
            styleItem.stylesContent = await compiller.compile();
            styleItem.classNames = await compiller.getClassNameByStyleKeyAsync(item.key);
            loadedSnippets.push(styleItem);
        }

        this.snippets(loadedSnippets);
        this.working(false);
    }

    private async loadThemeForItem(item: StyleItemContract): Promise<object> {
        const parts = item.key.split("/");
        const isComponent = parts[0] === "components";
        let stylesKeys = this.getAllStyleKeys(item);
        if (isComponent && parts[2] !== "default") {
            const defaultKey = `${parts[0]}/${parts[1]}/default`;
            const defaultItem = await this.styleService.getStyleByKey(defaultKey); 
            const defaultKeys = this.getAllStyleKeys(defaultItem);
            stylesKeys.push(... defaultKeys);
        }
        const subTheme = {};
        stylesKeys = stylesKeys.filter((item, index, source) => source.indexOf(item) === index);
        for (const stylesKey of stylesKeys) {
            const styleValue = await this.styleService.getStyleByKey(stylesKey);
            if (styleValue) {
                this.mergeNestedObj(subTheme, stylesKey, styleValue);
            } else {
                console.warn("styleKey not found: ", stylesKey);
            }
        }

        return subTheme;
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
        } else if (typeof source === "object") {
            const propertyNames = Object.keys(source);
            for (const propertyName of propertyNames) {
                const propertyValue = source[propertyName];
                if (propertyName.toLowerCase().endsWith("key")) {
                    result.push(propertyValue);
                } else {
                    if (typeof propertyValue === "object") result.push(... this.getAllStyleKeys(propertyValue));
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