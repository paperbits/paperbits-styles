import { LinearGradientContract } from "./../../contracts/linearGradientContract";

export interface GradientOption {
    key: string;
    value: string;
    gradientContract: LinearGradientContract;
}