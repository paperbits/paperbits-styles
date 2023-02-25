import * as crypto from "crypto";
import * as Utils from "@paperbits/common/utils";
import { StyleSheet } from "@paperbits/common/styles";
import { IBlobStorage } from "@paperbits/common/persistence";
import { JssCompiler } from "./jssCompiler";
import { MimeTypes } from "@paperbits/common";

const hashingAlgorithm = "sha512";

export class StyleBuilder {
    constructor(private readonly outputBlobStorage: IBlobStorage) { }

    public async buildGlobalStyle(styleSheet: StyleSheet): Promise<void> {
        const compiler = new JssCompiler();
        const css = compiler.compile(styleSheet);
        const contentBytes = Utils.stringToUnit8Array(css);

        await this.outputBlobStorage.uploadBlob("styles/styles.css", contentBytes, "text/css");
    }

    /**
     * Builds a CSS file out of stylesheet models and returns SHA-512 hash for the sub-resource integrity check.
     */
    public async buildStyle(permalink: string, ...styleSheets: StyleSheet[]): Promise<string> {
        const compiler = new JssCompiler();
        const css = compiler.compile(...styleSheets);
        const contentBytes = Utils.stringToUnit8Array(css);

        await this.outputBlobStorage.uploadBlob(permalink, contentBytes, MimeTypes.textCss);

        const sha512hash = crypto.createHash(hashingAlgorithm);
        sha512hash.update(contentBytes);

        const signature = sha512hash.digest("base64");
        return `${hashingAlgorithm}-${signature}`;
    }
}