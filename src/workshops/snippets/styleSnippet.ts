import * as ko from "knockout";
import template from "./styleSnippet.html";
import { Component, Param, OnMounted, Encapsulation } from "@paperbits/common/ko/decorators";
import { StyleItem } from "../../models/styleItem";

@Component({
    selector: "style-snippet",
    template: template,
    encapsulation: Encapsulation.shadowDom
})
export class StyleSnippet {
    public classNames: string;
    public stylesContent: string;

    @Param()
    public snippetItem: StyleItem;

    @OnMounted()
    public async loadSnippet(): Promise<void> {
        if (!this.snippetItem) {
            return;
        }

        this.classNames = this.snippetItem.classNames;
        this.stylesContent = this.snippetItem.stylesContent;
    }
}