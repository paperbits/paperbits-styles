import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common";
import * as mime from "mime-types";
import template from "./googleFonts.html";
import { HttpClient, HttpMethod } from "@paperbits/common/http";
import { IMediaService } from "@paperbits/common/media";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ISiteService } from "@paperbits/common/sites";
import { ViewManager } from "@paperbits/common/ui";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { FontContract } from "../../contracts/fontContract";
import { GoogleFontsConfig } from "./googleFontsConfig";
import { GoogleFontContract, GoogleFontsResult } from "./googleFontsParser";
import { GoogleFont } from "./googleFont";
import { FontParser } from "./../fonts/fontParser";


@Component({
    selector: "google-fonts",
    template: template
})
export class GoogleFonts {
    public readonly fonts: ko.ObservableArray<GoogleFont>;
    public readonly searchPattern: ko.Observable<string>;

    private loadedContracts: GoogleFontContract[];

    constructor(
        private readonly styleService: StyleService,
        private readonly httpClient: HttpClient,
        private readonly viewManager: ViewManager,
        private readonly mediaService: IMediaService,
        private readonly settingsProvider: ISettingsProvider,
        private readonly siteService: ISiteService
    ) {
        this.searchPattern = ko.observable("");
        this.fonts = ko.observableArray();
        this.selectedFont = ko.observable();
    }

    @Param()
    public readonly selectedFont: ko.Observable<FontContract>;

    @Event()
    public readonly onSelect: (font: FontContract) => void;

    @OnMounted()
    public async loadGoogleFonts(): Promise<void> {
        // Temporary:
        // const settings = await this.siteService.getSettings();
        // if (!settings || !settings.integration || !settings.integration.googleFonts) {
        //     return;
        // }
        //
        // const apiKey = settings.integration.googleFonts.apiKey;

        const apiKey = "AIzaSyDnNQwlwF8y3mxGwO5QglUyYZRj_VqNJgM"; 

        const response = await this.httpClient.send<GoogleFontsResult>({
            url: `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`,
            method: HttpMethod.get,
        });

        this.loadedContracts = response.toObject().items;

        await this.searchFonts();

        this.searchPattern
            .extend(ChangeRateLimit)
            .subscribe(this.searchFonts);
    }

    public searchFonts(): void {
        this.fonts([]);
        this.loadNextPage();
    }

    public async loadNextPage(): Promise<void> {
        if (!this.loadedContracts) {
            return;
        }
        const loadedCount = this.fonts().length;
        const pattern = this.searchPattern().toLowerCase();

        const fonts = this.loadedContracts
            .filter(x => x.family.toLowerCase().includes(pattern))
            .slice(loadedCount, loadedCount + 50).map(contract => new GoogleFont(contract));

        this.fonts.push(...fonts);
    }

    public async selectFont(googleFont: GoogleFont): Promise<void> {
        const fontContract = googleFont.toContract();
        const styles = await this.styleService.getStyles();

        styles.fonts[googleFont.identifier] = fontContract;

        await this.styleService.updateStyles(styles);

        if (this.selectedFont) {
            this.selectedFont(fontContract);
        }

        if (this.onSelect) {
            this.onSelect(fontContract);
        }
    }

    public async uploadFont(): Promise<void> {
        const files = await this.viewManager.openUploadDialog();
        const styles = await this.styleService.getStyles();
        const file = files[0];
        const content = await Utils.readFileAsByteArray(file);
        const fontContract = await FontParser.parse(content);
        const contentType = <string>mime.lookup(file.name);
        const fontVariant = fontContract.variants[0];
        const uploadPromise = this.mediaService.createMedia(file.name, content, contentType);

        this.viewManager.notifyProgress(uploadPromise, "Styles", `Uploading ${file.name}...`);

        const media = await uploadPromise;
        fontVariant.sourceKey = media.key;

        Objects.setValueWithCompensation(fontContract.key, styles, fontContract);

        this.styleService.updateStyles(styles);

        if (this.selectedFont) {
            this.selectedFont(fontContract);
        }

        if (this.onSelect) {
            this.onSelect(fontContract);
        }
    }
}