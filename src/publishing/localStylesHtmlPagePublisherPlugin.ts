import * as Utils from "@paperbits/common";
import { MimeTypes } from "@paperbits/common";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Attributes } from "@paperbits/common/html";
import { IBlobStorage } from "@paperbits/common/persistence";
import { HtmlPagePublisherPlugin } from "@paperbits/common/publishing";
import { HtmlPage } from "@paperbits/common/publishing/htmlPage";
import { StyleManager } from "@paperbits/common/styles";
import { StyleBuilder } from "../styleBuilder";


const localStylesheetFilePath = `/styles.css`;

export class LocalStyleHtmlPagePublisherPlugin implements HtmlPagePublisherPlugin {
    private localStyleBuilder: StyleBuilder;
    private subresourceIntegrityEnabled: boolean;

    constructor(
        private readonly settingsProvider: ISettingsProvider,
        outputBlobStorage: IBlobStorage
    ) {
        this.localStyleBuilder = new StyleBuilder(outputBlobStorage);
    }

    private initialize = Utils.debounce(this.loadSettings.bind(this));

    private async loadSettings(): Promise<void> {
        this.subresourceIntegrityEnabled = !!await this.settingsProvider.getSetting<boolean>("features/subresourceIntegrity");
    }

    private appendStyleLink(document: Document, href: string, integrity: string): void {
        const element: HTMLStyleElement = document.createElement("link");
        element.setAttribute(Attributes.Href, href);

        if (this.subresourceIntegrityEnabled && integrity) {
            element.setAttribute(Attributes.Integrity, integrity);
        }

        element.setAttribute(Attributes.Rel, "stylesheet");
        element.setAttribute(Attributes.Type, MimeTypes.textCss);

        document.head.appendChild(element);
    }

    public async apply(document: Document, page: HtmlPage): Promise<void> {
        await this.initialize();

        const styleManager: StyleManager = page.bindingContext?.styleManager;

        const localStylesheetPermalink = page.permalink === "/" // home page
            ? localStylesheetFilePath
            : `${page.permalink}${localStylesheetFilePath}`

        const styleSheets = styleManager.getAllStyleSheets();
        const hash = await this.localStyleBuilder.buildStyle(localStylesheetPermalink, ...styleSheets);

        this.appendStyleLink(document, localStylesheetPermalink, hash);
    }
}
