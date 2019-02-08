import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import template from "./googleFonts.html";
import { HttpClient, HttpMethod } from "@paperbits/common/http";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { FontContract, FontVariantContract } from "../../contracts/fontContract";
import { GoogleFontContract, GoogleFontsResult } from "./googleFontsParser";
import { GoogleFont } from "./googleFont";
import jss from "jss";
import preset from "jss-preset-default";

const opts = preset();

opts.createGenerateClassName = () => {
    return (rule, sheet) => {
        return Utils.camelCaseToKebabCase(rule.key);
    };
};

jss.setup(opts);

@Component({
    selector: "google-fonts",
    template: template,
    injectable: "googleFonts"
})
export class GoogleFonts {
    @Param()
    public readonly selectedFont: ko.Observable<FontContract>;

    @Event()
    public readonly onSelect: (font: FontContract) => void;

    public fonts: ko.ObservableArray<GoogleFont>;
    public searchPattern: ko.Observable<string>;

    private loadedContracts: GoogleFontContract[];
    private searchTimeout;

    constructor(
        private readonly styleService: StyleService,
        private readonly httpClient: HttpClient
    ) {
        this.loadGoogleFonts = this.loadGoogleFonts.bind(this);
        this.loadNextPage = this.loadNextPage.bind(this);
        this.selectFont = this.selectFont.bind(this);
        this.searchFonts = this.searchFonts.bind(this);

        this.searchPattern = ko.observable("");
        this.fonts = ko.observableArray<GoogleFont>();
        this.selectedFont = ko.observable();
    }

    @OnMounted()
    public async loadGoogleFonts(): Promise<void> {
        const googleFontsApiKey = "AIzaSyDnNQwlwF8y3mxGwO5QglUyYZRj_VqNJgM";

        const response = await this.httpClient.send<GoogleFontsResult>({
            url: `https://www.googleapis.com/webfonts/v1/webfonts?key=${googleFontsApiKey}`,
            method: HttpMethod.get,
        });

        this.loadedContracts = response.toObject().items;
        this.loadNextPage();

        this.searchPattern.subscribe(this.searchFonts);
    }

    public searchFonts(pattern: string): void {
        this.fonts([]);

        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(this.loadNextPage, 500);
    }

    public async loadNextPage(): Promise<void> {
        if (!this.loadedContracts) {
            return;
        }
        const loadedCount = this.fonts().length;
        const pattern = this.searchPattern().toLowerCase();

        const fonts = this.loadedContracts
            .filter(x => x.family.toLowerCase().contains(pattern))
            .slice(loadedCount, loadedCount + 50).map(contract => new GoogleFont(contract));

        this.fonts.push(...fonts);
    }

    public async selectFont(googleFont: GoogleFont): Promise<void> {
        const fontContract = googleFont.toContract();
        const styles = await this.styleService.getStyles();

        styles.fonts[googleFont.identifier] = fontContract;

        this.styleService.updateStyles(styles);

        if (this.selectedFont) {
            this.selectedFont(fontContract);
        }

        if (this.onSelect) {
            this.onSelect(fontContract);
        }
    }
}