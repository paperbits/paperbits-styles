import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import template from "./googleFonts.html";
import { IHttpClient, HttpMethod } from "@paperbits/common/http";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../styleService";
import { FontContract, FontVariantContract } from "../../contracts/fontContract";
import { GoogleFontContract, GoogleFontsResult } from "./googleFontsParser";
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
    public readonly selectedFont: KnockoutObservable<FontContract>;

    @Event()
    public readonly onSelect: (font: FontContract) => void;

    public fonts: KnockoutObservableArray<GoogleFontContract>;

    public compiledStyles: KnockoutObservable<string>;

    constructor(
        private readonly styleService: StyleService,
        private readonly httpClient: IHttpClient
    ) {
        this.loadGoogleFonts = this.loadGoogleFonts.bind(this);
        this.selectFont = this.selectFont.bind(this);

        this.compiledStyles = ko.observable<string>();
        this.fonts = ko.observableArray<GoogleFontContract>();
        this.selectedFont = ko.observable();
    }

    @OnMounted()
    public async loadGoogleFonts(): Promise<void> {
        const googleFontsApiKey = "AIzaSyDnNQwlwF8y3mxGwO5QglUyYZRj_VqNJgM";

        const response = await this.httpClient.send<GoogleFontsResult>({
            url: `https://www.googleapis.com/webfonts/v1/webfonts?key=${googleFontsApiKey}`,
            method: HttpMethod.get,
        });

        const payload = response.toObject();
        const fontFaceJssRules = [];
        const fonts = [];

        payload.items.slice(0, 25).forEach(googleFont => {
            const fileName = googleFont.files["regular"] || googleFont.files["400"] || googleFont.files[googleFont.variants[0]];

            fonts.push(googleFont);

            fontFaceJssRules.push({
                fontFamily: googleFont.family,
                src: `url(${fileName.replace("http://", "https://")})`,
                fontStyle: "normal",
                fontWeight: "normal"
            });
        });

        const result = {
            "@font-face": fontFaceJssRules
        };

        const styleSheet = jss.createStyleSheet(result);
        const compiledStyles = styleSheet.toString();

        this.compiledStyles(compiledStyles);
        this.fonts(fonts);
    }

    public async selectFont(googleFont: GoogleFontContract): Promise<void> {

        const identifier = Utils.identifier();

        const fontContract: FontContract = {
            key: `fonts/${identifier}`,
            family: googleFont.family,
            displayName: googleFont.family,
            category: googleFont.category,
            version: googleFont.version,
            lastModified: googleFont.lastModified,
            variants: googleFont.variants.map(variantName => {
                const regex = /(\d*)(\w*)/gm;
                const matches = regex.exec(variantName);

                /* Normal weight is equivalent to 400. Bold weight is quivalent to 700. */
                const fontWeight = matches[1] || 400;
                const fontStyle = matches[2] || "normal";
                const fontFile = googleFont.files[variantName];

                const fontVariant: FontVariantContract = {
                    weight: fontWeight,
                    style: fontStyle,
                    file: fontFile
                };

                return fontVariant;
            })
        };

        const styles = await this.styleService.getStyles();

        styles.fonts[identifier] = fontContract;

        if (this.selectedFont) {
            this.selectedFont(fontContract);
        }

        if (this.onSelect) {
            this.onSelect(fontContract);
        }
    }
}