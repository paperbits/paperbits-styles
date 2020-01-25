import * as ko from "knockout";
import { ThemeContract } from "../contracts";
import { VariationContract } from "@paperbits/common/styles";

export class StyleItem {
    public key: string;       
    public displayName: string;
    public category: string;
    public hasFocus: ko.Observable<boolean>;
    public stylesConfig: ThemeContract;
    public itemConfig: VariationContract;
    public classNames: string; 
    public stylesContent: string; 
    public stylesType: string; 

    constructor(contract: VariationContract, stylesConfig: ThemeContract, stylesType: string) {
        this.key = contract.key;
        this.displayName = contract.displayName;
        this.category = contract.category;
        this.hasFocus =  ko.observable();
        this.stylesConfig = stylesConfig;
        this.stylesType = stylesType;
    }
}