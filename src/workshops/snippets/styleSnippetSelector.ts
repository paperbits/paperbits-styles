import * as ko from "knockout";
import * as Objects from "@paperbits/common/objects";
import template from "./styleSnippetSelector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleSnippetService } from "../../styleSnippetService";
import { StyleItem } from "../../models/styleItem";
import { DefaultStyleCompiler } from "../../defaultStyleCompiler";
import { IPermalinkResolver } from "@paperbits/common/permalinks";
import { ThemeContract } from "../../contracts/themeContract";
import { identifier } from "@paperbits/common/utils";
import { getObjectAt } from "@paperbits/common/objects";
import { IStyleGroup } from "@paperbits/common/styles/IStyleGroup";
import { StyleCompiler, VariationContract } from "@paperbits/common/styles";

@Component({
    selector: "style-snippet-selector",
    template: template
})
export class StyleSnippetSelector {
    public readonly working: ko.Observable<boolean>;
    public readonly selectedSnippet: ko.Observable<StyleItem>;
    public readonly snippets: ko.ObservableArray<StyleItem>;
    public existingSnippetKeys: string[];
    public itemTemplate: string;

    private readonly snippetStyleCompiler: DefaultStyleCompiler;
    private isThemeSelected: boolean;

    @Param()
    public snippetType: string;

    @Event()
    public readonly onSelect: (snippet: VariationContract) => void;

    constructor(
        private readonly styleSnippetService: StyleSnippetService,
        private readonly mediaPermalinkResolver: IPermalinkResolver,
        private readonly styleGroups: IStyleGroup[]) {

        this.snippetStyleCompiler = new DefaultStyleCompiler(undefined, this.mediaPermalinkResolver);
        this.loadSnippets = this.loadSnippets.bind(this);
        this.selectSnippet = this.selectSnippet.bind(this);

        this.snippets = ko.observableArray();
        this.existingSnippetKeys = [];
        this.selectedSnippet = ko.observable();
        this.working = ko.observable(true);
    }

    @OnMounted()
    public async loadSnippets(): Promise<void> {
        if (!this.snippetType) {
            return;
        }
        this.working(true);

        if (!this.isThemeSelected) {
            await this.initSnippetService();
        }

        const snippetsByType = await this.styleSnippetService.getStyleByKey(this.snippetType);
        this.itemTemplate = this.getSnippetTypeTemplate(this.snippetType);
        const loadedSnippets = [];

        for (const it of Object.values(snippetsByType)) {
            const item = <VariationContract>it;
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

    private async initSnippetService(): Promise<void> {
        const selected = this.styleSnippetService.getSelectedThemeName();
        if (!selected) {
            const items = await this.styleSnippetService.getThemesNames();
            this.isThemeSelected = await this.styleSnippetService.selectCurrentTheme(items[0]); // TODO: remove selection the first theme
        }
    }

    private async loadThemeForItem(item: VariationContract): Promise<object> {
        const parts = item.key.split("/");
        const isComponent = parts[0] === "components";

        let stylesKeys = this.getAllStyleKeys(item);

        if (isComponent && parts[2] !== "default") {
            const defaultKey = `${parts[0]}/${parts[1]}/default`;
            const defaultItem = await this.styleSnippetService.getStyleByKey(defaultKey);
            const defaultKeys = this.getAllStyleKeys(defaultItem);

            stylesKeys.push(...defaultKeys);
        }

        const subTheme = {};

        stylesKeys = stylesKeys.filter((item, index, source) => source.indexOf(item) === index);

        for (const stylesKey of stylesKeys) {
            const styleValue = await this.styleSnippetService.getStyleByKey(stylesKey);

            if (styleValue) {
                this.mergeNestedObj(subTheme, stylesKey, styleValue);
            }
            else {
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
        }
        else if (typeof source === "object") {
            const propertyNames = Object.keys(source);

            for (const propertyName of propertyNames) {
                const propertyValue = source[propertyName];

                if (propertyName.toLowerCase().endsWith("key")) {
                    result.push(propertyValue);
                }
                else {
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
    }

    public addSnippet(): void {
        if (!this.onSelect) {
            return;
        }
        
        const selectedItem = Objects.clone<StyleItem>(this.selectedSnippet());
        const source = selectedItem.stylesConfig;
        selectedItem.stylesConfig = source;
        const allKeys = this.getAllStyleKeys(source).filter((item, index, source) => source.indexOf(item) === index);
        const refKeys = {};

        for (const path of allKeys) {
            const newKey = identifier();
            const oldValue = getObjectAt<VariationContract>(path, source);
            const keys = path.split("/");
            const lastKey = keys.pop();
            const lastObj = keys.reduce((source, key) => source[key] = source[key] || {}, source);
            oldValue.key = oldValue.key.replace(lastKey, newKey);
            oldValue.displayName = oldValue.displayName + " - " + newKey;
            lastObj[newKey] = oldValue;
            delete lastObj[lastKey];
            refKeys[path] = keys.join("/") + "/" + newKey;
        }
        this.syncStyleKeys(source, refKeys);
        selectedItem.key = refKeys[selectedItem.key];
        selectedItem.itemConfig = getObjectAt<VariationContract>(selectedItem.key, source);
        const selectedItemKeys = selectedItem.key.split("/");
        delete selectedItem.stylesConfig[selectedItemKeys[0]];
        this.onSelect(selectedItem);
    }

    private syncStyleKeys(source: any, changeTable: object): void {
        if (Array.isArray(source)) {
            source.every(x => this.syncStyleKeys(x, changeTable));
        }
        else if (typeof source === "object") {
            const propertyNames = Object.keys(source);

            for (const propertyName of propertyNames) {
                const propertyValue = source[propertyName];

                if (propertyName.toLowerCase().endsWith("key")) {
                    const newValue = changeTable[propertyValue];

                    if (newValue) {
                        source[propertyName] = newValue;
                    }
                }
                else {
                    if (typeof propertyValue === "object") {
                        this.syncStyleKeys(propertyValue, changeTable);
                    }
                }
            }
        }
    }
}