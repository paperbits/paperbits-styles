import { LinearGradientContract } from "./../../contracts/linearGradientContract";

export interface GradientOption {
    key: string;
    displayName: string;
    value: string;
    contract: LinearGradientContract;
}