import { IStyleSnippetService } from "@paperbits/common/styles/IStyleSnippetService";
import { ThemeContract } from "./contracts/themeContract";
import { Bag } from "@paperbits/common/bag";
import { HttpClient } from "@paperbits/common/http/httpClient";

export class StyleSnippetService implements IStyleSnippetService {
    private selectedThemeName: string;
    private styles: ThemeContract;
    private themes: Bag<ThemeContract>;

    constructor(private readonly httpClient: HttpClient) {}

    private async getThemes(): Promise<Bag<ThemeContract>> {
        if (!this.themes) {
            await this.loadStyleSnippets();
        }
        return this.themes;
    }

    private async loadStyleSnippets(): Promise<void> {
        const response = await this.httpClient.send({
            url: "/data/snippets-styles.json",
            method: "GET"
        });

        this.themes = <any>response.toObject();
    }

    public async getThemesNames(): Promise<string[]> {
        const source = await this.getThemes();
        return source && Object.keys(source) || [];
    }

    public getSelectedThemeName(): string {
        return this.selectedThemeName;
    }

    public async selectCurrentTheme(themeName: string): Promise<boolean> {
        this.selectedThemeName = themeName;
        const theme = await this.getThemeByName(themeName);
        this.styles = theme;
        
        return !!this.styles;
    }

    public async getThemeByName?(themeName: string): Promise<any> {
        const source = await this.getThemes();
        return source ? source[themeName] : null;
    }   
    
    public async getStyleByKey(key: string): Promise<ThemeContract> {
        if (!this.styles) {
            console.warn("current theme is not initialized");
            return null;
        }
        return this.getObjectByPath(this.styles, key);
    }

    private getObjectByPath(obj: any, pathKey: string): any {
        for (let i = 0, path = pathKey.split("/"), len = path.length; i < len; i++) {
            obj = obj[path[i]];
        }
        return obj;
    }
}